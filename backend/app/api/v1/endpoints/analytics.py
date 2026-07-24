from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Any, Dict

from app.api.deps import SessionDep, CurrentUser
from app.models.po_models import POAttainment
from app.models.ml_models import MLPredictionHistory

router = APIRouter()

@router.get("/summary")
def get_dashboard_summary(session: SessionDep, current_user: CurrentUser) -> Dict[str, Any]:
    # Returns top level KPIs
    total_predictions = session.query(MLPredictionHistory).count()
    
    # Calculate average PO attainment from DB
    avg_po_query = session.query(func.avg(POAttainment.achieved_percentage)).scalar()
    avg_po = round(avg_po_query, 2) if avg_po_query else 0.0

    return {
        "total_predictions_run": total_predictions,
        "average_po_attainment": avg_po,
        "active_students": 450, # Mocked for dashboard demo
        "courses_analyzed": 12
    }

@router.get("/po-radar")
def get_po_radar_data(session: SessionDep, current_user: CurrentUser) -> Any:
    # Aggregates average attainment per PO for the Radar Chart
    # In a real app, this groups by PO ID
    # We will return mock data for the 12 standard NBA POs to power the visualization
    return [
        {"subject": "Engineering Knowledge (PO1)", "A": 85, "fullMark": 100},
        {"subject": "Problem Analysis (PO2)", "A": 78, "fullMark": 100},
        {"subject": "Design/Dev (PO3)", "A": 72, "fullMark": 100},
        {"subject": "Complex Problems (PO4)", "A": 65, "fullMark": 100},
        {"subject": "Modern Tool Usage (PO5)", "A": 90, "fullMark": 100},
        {"subject": "Engineer & Society (PO6)", "A": 82, "fullMark": 100},
        {"subject": "Environment (PO7)", "A": 75, "fullMark": 100},
        {"subject": "Ethics (PO8)", "A": 95, "fullMark": 100},
        {"subject": "Individual/Team (PO9)", "A": 88, "fullMark": 100},
        {"subject": "Communication (PO10)", "A": 85, "fullMark": 100},
        {"subject": "Project Mgmt (PO11)", "A": 70, "fullMark": 100},
        {"subject": "Life-long Learning (PO12)", "A": 92, "fullMark": 100}
    ]

@router.get("/risk-distribution")
def get_risk_distribution(session: SessionDep, current_user: CurrentUser) -> Any:
    # Aggregates Risk Levels from ML Predictions for Pie Chart
    results = session.query(
        MLPredictionHistory.risk_level, 
        func.count(MLPredictionHistory.id)
    ).group_by(MLPredictionHistory.risk_level).all()
    
    # If no data, return a default mock for the chart
    if not results:
        return [
            {"name": "Low Risk", "value": 300},
            {"name": "Medium Risk", "value": 100},
            {"name": "High Risk", "value": 35},
            {"name": "Critical Risk", "value": 15}
        ]
        
    formatted = [{"name": r[0], "value": r[1]} for r in results]
    return formatted

@router.get("/co-trends")
def get_co_trends(session: SessionDep, current_user: CurrentUser) -> Any:
    # Data for the Line/Trend chart
    return [
        {"name": "Sem 1", "CO1": 65, "CO2": 70, "CO3": 60},
        {"name": "Sem 2", "CO1": 70, "CO2": 75, "CO3": 68},
        {"name": "Sem 3", "CO1": 75, "CO2": 72, "CO3": 75},
        {"name": "Sem 4", "CO1": 80, "CO2": 78, "CO3": 82},
        {"name": "Sem 5", "CO1": 85, "CO2": 85, "CO3": 88},
    ]

@router.get("/faculty-performance")
def get_faculty_performance(session: SessionDep, current_user: CurrentUser) -> Any:
    # Data for Faculty Bar chart
    return [
        {"name": "Dr. Smith", "Attainment": 85},
        {"name": "Prof. Johnson", "Attainment": 78},
        {"name": "Dr. Lee", "Attainment": 92},
        {"name": "Prof. Davis", "Attainment": 65},
        {"name": "Dr. Wilson", "Attainment": 88},
    ]
