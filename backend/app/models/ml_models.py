from sqlalchemy import Boolean, Column, Integer, String, DateTime, ForeignKey, Float, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base_class import Base

class MLDataset(Base):
    __tablename__ = "ml_datasets"

    id = Column(Integer, primary_key=True, index=True)
    version_name = Column(String, unique=True, index=True)
    file_path = Column(String)
    record_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    uploaded_by = Column(Integer, ForeignKey("user.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # We can store some basic stats here to render in the UI quickly
    features_list = Column(Text, nullable=True) # Comma separated list of features used

class MLTrainedModel(Base):
    __tablename__ = "ml_trained_models"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String, index=True)
    algorithm = Column(String)  # 'RandomForest', 'XGBoost', etc.
    target_type = Column(String) # 'CO' or 'PO'
    file_path = Column(String)  # Path to the .joblib file
    is_active = Column(Boolean, default=False) # Only one active per target_type
    
    # Evaluation Metrics
    accuracy = Column(Float, default=0.0)
    rmse = Column(Float, default=0.0)
    r2_score = Column(Float, default=0.0)
    
    dataset_id = Column(Integer, ForeignKey("ml_datasets.id"))
    trained_by = Column(Integer, ForeignKey("user.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class MLFeatureImportance(Base):
    __tablename__ = "ml_feature_importance"

    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("ml_trained_models.id", ondelete="CASCADE"))
    feature_name = Column(String)
    importance_score = Column(Float)

class MLPredictionHistory(Base):
    __tablename__ = "ml_prediction_history"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student.id"))
    model_id = Column(Integer, ForeignKey("ml_trained_models.id"))
    
    target_type = Column(String) # 'CO' or 'PO'
    target_id = Column(Integer) # id of the CO or PO
    
    predicted_value = Column(Float)
    confidence_score = Column(Float)
    
    # Low Risk, Medium Risk, High Risk, Critical Risk
    risk_level = Column(String)
    
    created_at = Column(DateTime, default=datetime.utcnow)
