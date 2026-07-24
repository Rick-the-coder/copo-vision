from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Optional
from app.api.deps import SessionDep, CurrentUser
from app.models.user import UserRole
from app.models.ml_models import MLDataset, MLTrainedModel, MLFeatureImportance, MLPredictionHistory

from app.services.ml.dataset_service import DatasetService
from app.services.ml.training_service import ModelTrainingService
from app.services.ml.prediction_service import PredictionService

router = APIRouter()

@router.post("/dataset/upload")
def upload_dataset(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    file: UploadFile = File(...),
    version_name: str = Form(...)
):
    if current_user.role not in [UserRole.ADMIN, UserRole.HOD, UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    # Check if version exists
    existing = session.query(MLDataset).filter(MLDataset.version_name == version_name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Dataset version name already exists.")

    stats = DatasetService.process_and_save_upload(file, version_name)
    
    # Save DB Record
    new_ds = MLDataset(
        version_name=version_name,
        file_path=stats["file_path"],
        record_count=stats["record_count"],
        features_list=stats["features_list"],
        uploaded_by=current_user.id
    )
    session.add(new_ds)
    session.commit()
    session.refresh(new_ds)
    
    return {"message": "Dataset uploaded successfully", "dataset_id": new_ds.id, "preview": stats["preview"]}

@router.get("/datasets")
def get_datasets(session: SessionDep, current_user: CurrentUser):
    return session.query(MLDataset).order_by(MLDataset.created_at.desc()).all()


class TrainRequest(BaseModel):
    dataset_id: int
    target_column: str
    target_type: str # 'CO' or 'PO'

@router.post("/train")
def train_model(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    req: TrainRequest
):
    dataset = session.query(MLDataset).filter(MLDataset.id == req.dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    try:
        df = DatasetService.get_dataframe(dataset.file_path)
        
        # This is synchronous for this MVP. In production, this goes to Celery/BackgroundTasks.
        results = ModelTrainingService.train_and_compare(df, req.target_column, req.target_type)
        
        # Deactivate older models of same target type
        session.query(MLTrainedModel).filter(MLTrainedModel.target_type == req.target_type).update({"is_active": False})
        
        # Save new trained model record
        new_model = MLTrainedModel(
            model_name=f"{results['best_model_name']}_{req.target_type}",
            algorithm=results['best_model_name'],
            target_type=req.target_type,
            file_path=results['file_path'],
            is_active=True,
            accuracy=results['metrics']['accuracy'],
            rmse=results['metrics']['rmse'],
            r2_score=results['metrics']['r2_score'],
            dataset_id=dataset.id,
            trained_by=current_user.id
        )
        session.add(new_model)
        session.flush() # get ID
        
        # Save feature importance
        for feat, score in results['feature_importance'].items():
            session.add(MLFeatureImportance(
                model_id=new_model.id,
                feature_name=feat,
                importance_score=score
            ))
            
        session.commit()
        return {"status": "success", "results": results}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/models")
def get_trained_models(session: SessionDep, current_user: CurrentUser):
    models = session.query(MLTrainedModel).order_by(MLTrainedModel.created_at.desc()).all()
    # Attach top 5 features
    response = []
    for m in models:
        feats = session.query(MLFeatureImportance).filter(MLFeatureImportance.model_id == m.id).order_by(MLFeatureImportance.importance_score.desc()).limit(5).all()
        m_dict = {
            "id": m.id,
            "model_name": m.model_name,
            "algorithm": m.algorithm,
            "target_type": m.target_type,
            "is_active": m.is_active,
            "accuracy": m.accuracy,
            "rmse": m.rmse,
            "r2_score": m.r2_score,
            "created_at": m.created_at,
            "top_features": [f.feature_name for f in feats]
        }
        response.append(m_dict)
    return response

class PredictRequest(BaseModel):
    student_id: int
    target_type: str
    target_id: int
    features: dict

@router.post("/predict")
def run_prediction(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    req: PredictRequest
):
    active_model = session.query(MLTrainedModel).filter(
        MLTrainedModel.target_type == req.target_type, 
        MLTrainedModel.is_active == True
    ).first()
    
    if not active_model:
        raise HTTPException(status_code=400, detail=f"No active trained model found for {req.target_type} prediction.")
        
    try:
        model_bundle = PredictionService.load_model(active_model.file_path)
        prediction_result = PredictionService.predict_student_attainment(model_bundle, req.features)
        
        # Save History
        history = MLPredictionHistory(
            student_id=req.student_id,
            model_id=active_model.id,
            target_type=req.target_type,
            target_id=req.target_id,
            predicted_value=prediction_result["predicted_percentage"],
            confidence_score=prediction_result["confidence_score"],
            risk_level=prediction_result["risk_level"]
        )
        session.add(history)
        session.commit()
        
        return prediction_result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
@router.get("/prediction-history")
def get_history(session: SessionDep, current_user: CurrentUser, limit: int = 50):
    return session.query(MLPredictionHistory).order_by(MLPredictionHistory.created_at.desc()).limit(limit).all()
