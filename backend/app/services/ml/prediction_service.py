import os
import joblib
import pandas as pd
import numpy as np
from app.services.ml.feature_service import FeatureEngineeringService

class PredictionService:
    @staticmethod
    def load_model(file_path: str) -> dict:
        if not os.path.exists(file_path):
            raise FileNotFoundError("Active model file not found.")
        return joblib.load(file_path)

    @staticmethod
    def predict_student_attainment(model_bundle: dict, student_data: dict) -> dict:
        """
        student_data: A dictionary of features for a single student (e.g. current marks)
        """
        model = model_bundle["model"]
        expected_features = model_bundle["expected_features"]
        
        # Convert dictionary to DataFrame for feature engineering
        df = pd.DataFrame([student_data])
        
        # Apply the exact same feature engineering used during training
        df = FeatureEngineeringService.engineer_features(df)
        
        # Ensure all expected features exist, fill missing with 0
        for feature in expected_features:
            if feature not in df.columns:
                df[feature] = 0
                
        # Select only the features the model was trained on, in the exact order
        X = df[expected_features]
        
        # Predict
        prediction = model.predict(X)[0]
        
        # Bounding logic (Assuming percentage 0-100)
        prediction = max(0.0, min(100.0, float(prediction)))
        
        # Calculate Confidence Score (Pseudo calculation based on proximity to training boundaries)
        # In a real scenario, this might use prediction intervals from GradientBoosting or RandomForest variances
        confidence_score = 85.0 + (np.random.random() * 10) # Mock high confidence for demonstration
        
        # Risk Analysis
        risk_level = "Low Risk"
        if prediction < 40:
            risk_level = "Critical Risk"
        elif prediction < 55:
            risk_level = "High Risk"
        elif prediction < 70:
            risk_level = "Medium Risk"
            
        return {
            "predicted_percentage": round(prediction, 2),
            "confidence_score": round(confidence_score, 2),
            "risk_level": risk_level
        }
