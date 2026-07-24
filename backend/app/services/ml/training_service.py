import os
import pandas as pd
import numpy as np
import joblib
from datetime import datetime
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.tree import DecisionTreeRegressor
from sklearn.linear_model import LinearRegression
from sklearn.svm import SVR
from sklearn.metrics import mean_squared_error, r2_score
import xgboost as xgb

from app.services.ml.feature_service import FeatureEngineeringService

MODELS_DIR = "trained_models"

class ModelTrainingService:
    @staticmethod
    def train_and_compare(df: pd.DataFrame, target_column: str, model_prefix: str) -> dict:
        """
        Trains multiple models, evaluates them, saves the best one, and returns metrics.
        target_column could be 'CO_Attainment' or 'PO_Attainment'
        """
        if target_column not in df.columns:
            raise ValueError(f"Target column '{target_column}' not found in dataset.")
            
        # 1. Feature Engineering
        df = FeatureEngineeringService.engineer_features(df)
        
        # 2. Prepare Data (Exclude non-numeric and IDs)
        # In production, we'd use OneHotEncoder for categoricals. For now, select numerics.
        numeric_df = df.select_dtypes(include=[np.number])
        X = numeric_df.drop(columns=[target_column, 'id', 'student_id'], errors='ignore')
        y = numeric_df[target_column]
        
        feature_names = list(X.columns)
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # 3. Define Models to compare
        models = {
            "RandomForest": RandomForestRegressor(n_estimators=100, random_state=42),
            "XGBoost": xgb.XGBRegressor(objective='reg:squarederror', random_state=42),
            "GradientBoosting": GradientBoostingRegressor(random_state=42),
            "DecisionTree": DecisionTreeRegressor(random_state=42),
            "LinearRegression": LinearRegression(),
            "SVR": SVR()
        }
        
        results = {}
        best_model = None
        best_r2 = -float('inf')
        best_name = ""
        
        # 4. Train and Evaluate
        for name, model in models.items():
            model.fit(X_train, y_train)
            predictions = model.predict(X_test)
            
            rmse = np.sqrt(mean_squared_error(y_test, predictions))
            r2 = r2_score(y_test, predictions)
            
            # Simplified pseudo-accuracy for regression based on R2 mapped to a percentage context
            accuracy = max(0, min(100, r2 * 100)) 
            
            results[name] = {
                "rmse": float(rmse),
                "r2_score": float(r2),
                "accuracy": float(accuracy)
            }
            
            if r2 > best_r2:
                best_r2 = r2
                best_model = model
                best_name = name
                
        # 5. Extract Feature Importance for the best tree-based model
        feature_importance = {}
        if hasattr(best_model, 'feature_importances_'):
            importances = best_model.feature_importances_
            for idx, imp in enumerate(importances):
                feature_importance[feature_names[idx]] = float(imp)
        elif hasattr(best_model, 'coef_'):
            importances = np.abs(best_model.coef_)
            for idx, imp in enumerate(importances):
                feature_importance[feature_names[idx]] = float(imp)
                
        # Sort feature importance
        feature_importance = dict(sorted(feature_importance.items(), key=lambda item: item[1], reverse=True)[:10])

        # 6. Save the Best Model
        os.makedirs(MODELS_DIR, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        model_filename = f"{model_prefix}_{best_name}_{timestamp}.joblib"
        file_path = os.path.join(MODELS_DIR, model_filename)
        
        # Save model pipeline (we wrap it to include feature names it expects)
        model_bundle = {
            "model": best_model,
            "expected_features": feature_names,
            "target_type": model_prefix # 'CO' or 'PO'
        }
        joblib.dump(model_bundle, file_path)
        
        return {
            "best_model_name": best_name,
            "file_path": file_path,
            "metrics": results[best_name],
            "all_results": results,
            "feature_importance": feature_importance
        }
