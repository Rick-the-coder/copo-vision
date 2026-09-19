import io
import os
from pathlib import Path
from fastapi import UploadFile, HTTPException
import pytest
from app.services.ml.dataset_service import DatasetService, UPLOAD_DIR
from app.services.ml.training_service import ModelTrainingService


def create_upload_file(content: str = "feature1,feature2,CO_Attainment\n10,20,85\n15,25,90\n12,22,88\n14,24,92\n11,21,86\n13,23,89\n", filename: str = "dataset.csv") -> UploadFile:
    file_bytes = io.BytesIO(content.encode("utf-8"))
    return UploadFile(filename=filename, file=file_bytes)


def cleanup_file(file_path: str):
    try:
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
    except Exception:
        pass


def test_normal_upload_success():
    """Test 1 — Normal upload creates physical file inside storage directory and returns analysis."""
    upload = create_upload_file(filename="student_scores.csv")
    result = DatasetService.process_and_save_upload(upload, version_name="v1.0.0")

    try:
        assert "file_path" in result
        assert "record_count" in result
        assert "features_list" in result
        assert "preview" in result

        file_path = result["file_path"]
        assert os.path.exists(file_path)

        # Invariant: storage directory containment
        storage_root = Path(UPLOAD_DIR).resolve()
        resolved_path = Path(file_path).resolve()
        assert resolved_path.parent == storage_root
        assert resolved_path.is_relative_to(storage_root)

        # Verify content analysis
        assert result["record_count"] == 6
        assert "feature1" in result["features_list"]
        assert "CO_Attainment" in result["features_list"]
        assert len(result["preview"]) <= 5
    finally:
        cleanup_file(result.get("file_path"))


def test_relative_traversal_attempt():
    """Test 2 — Relative traversal payloads cannot escape storage directory."""
    traversal_payloads = [
        "../../outside",
        "../escape",
        "../../etc/passwd",
    ]

    for payload in traversal_payloads:
        upload = create_upload_file()
        result = DatasetService.process_and_save_upload(upload, version_name=payload)

        try:
            file_path = result["file_path"]
            assert os.path.exists(file_path)

            # Physical file must be strictly inside UPLOAD_DIR
            storage_root = Path(UPLOAD_DIR).resolve()
            resolved_path = Path(file_path).resolve()
            assert resolved_path.parent == storage_root
            assert resolved_path.is_relative_to(storage_root)

            # The user-supplied malicious version name must NOT be part of physical filename
            assert "outside" not in resolved_path.name
            assert "escape" not in resolved_path.name
            assert "passwd" not in resolved_path.name
            assert ".." not in str(resolved_path)
        finally:
            cleanup_file(result.get("file_path"))


def test_nested_traversal_attempt():
    """Test 3 — Deeply nested relative traversal payloads cannot escape storage directory."""
    payloads = [
        "../../../tmp/evil",
        "../../../../var/log/attack",
        "nested/../../../../system_exploit",
    ]

    for payload in payloads:
        upload = create_upload_file()
        result = DatasetService.process_and_save_upload(upload, version_name=payload)

        try:
            file_path = result["file_path"]
            assert os.path.exists(file_path)

            storage_root = Path(UPLOAD_DIR).resolve()
            resolved_path = Path(file_path).resolve()
            assert resolved_path.parent == storage_root
            assert resolved_path.is_relative_to(storage_root)
            assert "evil" not in resolved_path.name
            assert "attack" not in resolved_path.name
        finally:
            cleanup_file(result.get("file_path"))


def test_absolute_path_attempt():
    """Test 4 — Platform absolute path payloads cannot redirect storage location."""
    payloads = [
        "/tmp/evil",
        "/etc/cron.d/malicious",
        "C:\\temp\\evil",
        "C:/windows/system32/evil",
    ]

    for payload in payloads:
        upload = create_upload_file()
        result = DatasetService.process_and_save_upload(upload, version_name=payload)

        try:
            file_path = result["file_path"]
            assert os.path.exists(file_path)

            storage_root = Path(UPLOAD_DIR).resolve()
            resolved_path = Path(file_path).resolve()
            assert resolved_path.parent == storage_root
            assert resolved_path.is_relative_to(storage_root)
            assert "tmp" not in resolved_path.name
            assert "system32" not in resolved_path.name
        finally:
            cleanup_file(result.get("file_path"))


def test_windows_style_traversal_attempt():
    """Test 5 — Windows backslash directory traversal payloads cannot escape storage directory."""
    payloads = [
        "..\\..\\outside",
        "..\\..\\..\\windows_evil",
        "subdir\\..\\..\\..\\sensitive_location",
    ]

    for payload in payloads:
        upload = create_upload_file()
        result = DatasetService.process_and_save_upload(upload, version_name=payload)

        try:
            file_path = result["file_path"]
            assert os.path.exists(file_path)

            storage_root = Path(UPLOAD_DIR).resolve()
            resolved_path = Path(file_path).resolve()
            assert resolved_path.parent == storage_root
            assert resolved_path.is_relative_to(storage_root)
            assert "outside" not in resolved_path.name
            assert "windows_evil" not in resolved_path.name
        finally:
            cleanup_file(result.get("file_path"))


def test_non_csv_and_invalid_filenames():
    """Test 6 — Non-CSV files, uppercase extensions, and invalid filenames."""
    # 6a. Non-CSV extension rejected
    non_csv_upload = create_upload_file(filename="dataset.txt")
    with pytest.raises(HTTPException) as exc_info:
        DatasetService.process_and_save_upload(non_csv_upload, version_name="v1")
    assert exc_info.value.status_code == 400
    assert "Only CSV files are supported" in exc_info.value.detail

    # 6b. Executable or tricky double extension rejected
    exe_upload = create_upload_file(filename="dataset.csv.exe")
    with pytest.raises(HTTPException) as exc_info:
        DatasetService.process_and_save_upload(exe_upload, version_name="v1")
    assert exc_info.value.status_code == 400

    # 6c. Missing / None filename rejected
    none_filename_upload = create_upload_file(filename="")
    none_filename_upload.filename = None
    with pytest.raises(HTTPException) as exc_info:
        DatasetService.process_and_save_upload(none_filename_upload, version_name="v1")
    assert exc_info.value.status_code == 400

    # 6d. Uppercase and mixed-case .CSV accepted
    uppercase_upload = create_upload_file(filename="DATASET.CSV")
    result_upper = DatasetService.process_and_save_upload(uppercase_upload, version_name="v_upper")
    try:
        assert os.path.exists(result_upper["file_path"])
    finally:
        cleanup_file(result_upper.get("file_path"))

    mixed_upload = create_upload_file(filename="Dataset.Csv")
    result_mixed = DatasetService.process_and_save_upload(mixed_upload, version_name="v_mixed")
    try:
        assert os.path.exists(result_mixed["file_path"])
    finally:
        cleanup_file(result_mixed.get("file_path"))


def test_generated_filename_uniqueness_and_decoupling():
    """Test 7 — Server generates unique storage identifiers independent of version name."""
    upload1 = create_upload_file()
    upload2 = create_upload_file()

    # Uploading with identical or different version names
    result1 = DatasetService.process_and_save_upload(upload1, version_name="duplicate_version_name")
    result2 = DatasetService.process_and_save_upload(upload2, version_name="duplicate_version_name")

    try:
        path1 = result1["file_path"]
        path2 = result2["file_path"]

        # Files must both exist and be distinct
        assert os.path.exists(path1)
        assert os.path.exists(path2)
        assert path1 != path2

        # Physical filenames must not equal or be derived from the version name
        name1 = Path(path1).name
        name2 = Path(path2).name
        assert name1 != "duplicate_version_name.csv"
        assert name2 != "duplicate_version_name.csv"
        assert "duplicate_version_name" not in name1
        assert "duplicate_version_name" not in name2
    finally:
        cleanup_file(result1.get("file_path"))
        cleanup_file(result2.get("file_path"))


def test_path_security_containment_invariant():
    """Phase 7 — Strict path containment check verifying no escape sequences exist in resolved path."""
    upload = create_upload_file()
    result = DatasetService.process_and_save_upload(upload, version_name="../../traversal_probe")

    try:
        file_path = result["file_path"]
        storage_root = Path(UPLOAD_DIR).resolve()
        resolved_file_path = Path(file_path).resolve()

        # Exact parent containment check
        assert resolved_file_path.parent == storage_root
        assert resolved_file_path.is_relative_to(storage_root)
        assert resolved_file_path.is_file()
    finally:
        cleanup_file(result.get("file_path"))


def test_downstream_dataframe_and_training_compatibility():
    """Phase 8 — Test downstream contract: MLDataset.file_path -> get_dataframe() -> ModelTrainingService."""
    csv_data = (
        "student_id,attendance_rate,internal_score,assignment_avg,CO_Attainment\n"
        "1,85,78,82,80\n"
        "2,90,88,91,89\n"
        "3,60,50,55,52\n"
        "4,95,92,94,93\n"
        "5,75,70,72,71\n"
        "6,80,74,79,77\n"
        "7,88,84,86,85\n"
        "8,65,58,60,59\n"
        "9,92,89,90,91\n"
        "10,70,64,68,66\n"
    )
    upload = create_upload_file(content=csv_data, filename="academic_data.csv")
    result = DatasetService.process_and_save_upload(upload, version_name="academic_v1")

    try:
        file_path = result["file_path"]

        # 1. Test DatasetService.get_dataframe(file_path)
        df = DatasetService.get_dataframe(file_path)
        assert df is not None
        assert len(df) == 10
        assert "CO_Attainment" in df.columns

        # 2. Test ModelTrainingService.train_and_compare(df)
        train_results = ModelTrainingService.train_and_compare(
            df=df,
            target_column="CO_Attainment",
            model_prefix="CO"
        )
        assert "best_model_name" in train_results
        assert "file_path" in train_results
        assert "metrics" in train_results
        assert "feature_importance" in train_results

        # Clean up generated model file
        cleanup_file(train_results.get("file_path"))
    finally:
        cleanup_file(result.get("file_path"))
