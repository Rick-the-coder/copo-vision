import os
import shutil
import uuid
from pathlib import Path
from fastapi import UploadFile, HTTPException
import numpy as np
import pandas as pd

UPLOAD_DIR = "datasets_storage"

class DatasetService:
    @staticmethod
    def process_and_save_upload(file: UploadFile, version_name: str) -> dict:
        if not file.filename or not file.filename.lower().endswith('.csv'):
            raise HTTPException(status_code=400, detail="Only CSV files are supported currently.")
            
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        storage_id = uuid.uuid4().hex
        filename = f"{storage_id}.csv"
        file_path = os.path.join(UPLOAD_DIR, filename)

        # Verify path containment inside UPLOAD_DIR
        resolved_upload_dir = Path(UPLOAD_DIR).resolve()
        resolved_file_path = Path(file_path).resolve()
        if not resolved_file_path.is_relative_to(resolved_upload_dir):
            raise HTTPException(status_code=500, detail="Invalid storage path configuration.")

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        return DatasetService.analyze_dataset(file_path)

    @staticmethod
    def analyze_dataset(file_path: str) -> dict:
        try:
            df = pd.read_csv(file_path)
            
            # Preprocessing: Clean data
            # Drop duplicates
            df.drop_duplicates(inplace=True)
            
            # Handle missing values - simple numeric mean imputation for this phase
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].mean())
            
            # Separate features and target (Assuming targets are explicitly named 'CO_Target' or 'PO_Target')
            # For flexibility, we just return basic stats
            record_count = len(df)
            features = list(df.columns)
            
            return {
                "file_path": file_path,
                "record_count": record_count,
                "features_list": ",".join(features),
                "preview": df.head(5).to_dict(orient="records")
            }
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to process dataset: {str(e)}")
            
    @staticmethod
    def get_dataframe(file_path: str) -> pd.DataFrame:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Dataset not found at {file_path}")
        return pd.read_csv(file_path)
