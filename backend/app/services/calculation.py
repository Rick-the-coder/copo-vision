from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.student_mark import StudentMark
from app.models.question_bank import QuestionBank
from app.models.co_attainment import COAttainment
from app.models.co_attainment_history import COAttainmentHistory
from app.models.attainment_rule import AttainmentRule
from app.models.co_configuration import COConfiguration
from app.models.assessment import Assessment
from fastapi import HTTPException
from typing import List, Dict

class COCalculationService:
    def __init__(self, session: Session, user_id: int):
        self.session = session
        self.user_id = user_id
        
        # Load configs
        self.config = self.session.query(COConfiguration).first()
        self.rules = self.session.query(AttainmentRule).all()
        
        if not self.config or not self.rules:
            raise HTTPException(status_code=500, detail="CO Configuration or Attainment Rules missing. Please configure them first.")

    def get_attainment_level(self, percentage: float) -> str:
        for rule in self.rules:
            if rule.min_percentage <= percentage <= rule.max_percentage:
                return rule.level_name
        return "Level 0"

    def calculate_for_assessment(self, assessment_id: int):
        assessment = self.session.query(Assessment).filter(Assessment.id == assessment_id).first()
        if not assessment:
            raise HTTPException(status_code=404, detail="Assessment not found")

        # 1. Fetch all finalized marks for this assessment
        marks = self.session.query(StudentMark).filter(
            StudentMark.assessment_id == assessment_id,
            StudentMark.is_final_submission == True
        ).all()

        if not marks:
            raise HTTPException(status_code=400, detail="No finalized marks found for this assessment.")

        # 2. Map student marks to COs via QuestionBank
        student_co_aggregates: Dict[int, Dict[int, dict]] = {} # student_id -> {co_id: {obtained: float, max: float}}

        for mark in marks:
            # If the mark is directly mapped to a question
            if mark.question_id:
                question = self.session.query(QuestionBank).filter(QuestionBank.id == mark.question_id).first()
                if question and question.co_id:
                    student_id = mark.student_id
                    co_id = question.co_id
                    
                    if student_id not in student_co_aggregates:
                        student_co_aggregates[student_id] = {}
                    
                    if co_id not in student_co_aggregates[student_id]:
                        student_co_aggregates[student_id][co_id] = {"obtained": 0.0, "max": 0.0}
                        
                    student_co_aggregates[student_id][co_id]["obtained"] += mark.marks_obtained
                    student_co_aggregates[student_id][co_id]["max"] += question.maximum_marks

        # 3. Calculate percentage and level, save to DB
        results = []
        for student_id, cos in student_co_aggregates.items():
            for co_id, totals in cos.items():
                if totals["max"] > 0:
                    percentage = (totals["obtained"] / totals["max"]) * 100
                    level = self.get_attainment_level(percentage)

                    # Check for existing
                    existing = self.session.query(COAttainment).filter(
                        COAttainment.student_id == student_id,
                        COAttainment.co_id == co_id,
                        COAttainment.assessment_id == assessment_id
                    ).first()

                    if existing:
                        # Log history
                        history = COAttainmentHistory(
                            co_attainment_id=existing.id,
                            previous_percentage=existing.attainment_percentage,
                            new_percentage=percentage,
                            calculated_by=self.user_id
                        )
                        self.session.add(history)

                        existing.attainment_percentage = percentage
                        existing.attainment_level = level
                    else:
                        new_attainment = COAttainment(
                            student_id=student_id,
                            course_id=assessment.course_id,
                            co_id=co_id,
                            assessment_id=assessment_id,
                            attainment_percentage=percentage,
                            attainment_level=level,
                            academic_year=assessment.academic_year_id, # Simplified reference for MVP
                            semester=assessment.semester_id
                        )
                        self.session.add(new_attainment)
                        self.session.flush() # flush to get ID
                        
                        history = COAttainmentHistory(
                            co_attainment_id=new_attainment.id,
                            previous_percentage=None,
                            new_percentage=percentage,
                            calculated_by=self.user_id
                        )
                        self.session.add(history)
                        
                    results.append({"student_id": student_id, "co_id": co_id, "percentage": percentage, "level": level})

        self.session.commit()
        return {"status": "success", "calculated_records": len(results)}
