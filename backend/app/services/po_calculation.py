from sqlalchemy.orm import Session
from app.models.co_attainment import COAttainment
from app.models.po_models import COPOMapping, POAttainment, POAttainmentHistory, POConfiguration
from typing import List, Dict, Tuple
from fastapi import HTTPException
import uuid

class POCalculationService:
    @staticmethod
    def calculate_po_for_course(db: Session, course_id: int, user_id: int) -> dict:
        """
        Calculates PO and PSO attainment for all students in a given course
        based on their CO Attainments and the CO-PO Mapping Matrix.
        
        Formula: PO = Sum(CO Attainment * Correlation Weight) / Sum(Correlation Weight)
        """
        
        # 1. Fetch Configuration
        config = db.query(POConfiguration).first()
        if not config:
            raise HTTPException(status_code=500, detail="PO Configuration is missing.")

        # 2. Fetch Mapping Matrix for this course
        mappings = db.query(COPOMapping).filter(COPOMapping.course_id == course_id, COPOMapping.correlation_level > 0).all()
        if not mappings:
            raise HTTPException(status_code=400, detail="No CO-PO/PSO mapping matrix defined for this course.")

        # Organize mappings by co_id
        # co_id -> {'po_id_1': weight, 'pso_id_1': weight}
        mapping_dict = {}
        for m in mappings:
            if m.co_id not in mapping_dict:
                mapping_dict[m.co_id] = {'pos': {}, 'psos': {}}
            if m.po_id:
                mapping_dict[m.co_id]['pos'][m.po_id] = m.correlation_level
            if m.pso_id:
                mapping_dict[m.co_id]['psos'][m.pso_id] = m.correlation_level

        # 3. Fetch CO Attainments for all students in this course
        co_attainments = db.query(COAttainment).filter(COAttainment.course_id == course_id).all()
        if not co_attainments:
            raise HTTPException(status_code=400, detail="No CO Attainments found for this course. Please run CO Engine first.")

        # Group CO attainments by student
        # student_id -> {co_id: achieved_percentage}
        student_cos = {}
        for ca in co_attainments:
            if ca.student_id not in student_cos:
                student_cos[ca.student_id] = {}
            student_cos[ca.student_id][ca.co_id] = ca.achieved_percentage

        batch_uuid = str(uuid.uuid4())
        records_to_insert = []

        # 4. Perform calculation per student
        for student_id, cos in student_cos.items():
            po_sums = {}  # po_id -> {'weighted_sum': 0, 'weight_total': 0}
            pso_sums = {} # pso_id -> {'weighted_sum': 0, 'weight_total': 0}

            for co_id, achieved_pct in cos.items():
                if co_id in mapping_dict:
                    # Process PO mappings for this CO
                    for po_id, weight in mapping_dict[co_id]['pos'].items():
                        if po_id not in po_sums:
                            po_sums[po_id] = {'weighted_sum': 0.0, 'weight_total': 0}
                        po_sums[po_id]['weighted_sum'] += (achieved_pct * weight)
                        po_sums[po_id]['weight_total'] += weight
                        
                    # Process PSO mappings for this CO
                    for pso_id, weight in mapping_dict[co_id]['psos'].items():
                        if pso_id not in pso_sums:
                            pso_sums[pso_id] = {'weighted_sum': 0.0, 'weight_total': 0}
                        pso_sums[pso_id]['weighted_sum'] += (achieved_pct * weight)
                        pso_sums[pso_id]['weight_total'] += weight

            # Finalize POs for the student
            for po_id, data in po_sums.items():
                if data['weight_total'] > 0:
                    final_pct = data['weighted_sum'] / data['weight_total']
                    # Determine level (simplistic mapping based on Target Percentage)
                    level = 0
                    if final_pct >= config.target_percentage:
                        level = 3
                    elif final_pct >= config.target_percentage - 10:
                        level = 2
                    elif final_pct >= config.target_percentage - 20:
                        level = 1

                    records_to_insert.append(POAttainment(
                        student_id=student_id,
                        course_id=course_id,
                        po_id=po_id,
                        pso_id=None,
                        achieved_percentage=round(final_pct, 2),
                        attainment_level=level
                    ))

            # Finalize PSOs for the student
            for pso_id, data in pso_sums.items():
                if data['weight_total'] > 0:
                    final_pct = data['weighted_sum'] / data['weight_total']
                    level = 0
                    if final_pct >= config.target_percentage:
                        level = 3
                    elif final_pct >= config.target_percentage - 10:
                        level = 2
                    elif final_pct >= config.target_percentage - 20:
                        level = 1

                    records_to_insert.append(POAttainment(
                        student_id=student_id,
                        course_id=course_id,
                        po_id=None,
                        pso_id=pso_id,
                        achieved_percentage=round(final_pct, 2),
                        attainment_level=level
                    ))

        # 5. Delete existing records for this course to prevent duplicates on recalculation
        db.query(POAttainment).filter(POAttainment.course_id == course_id).delete()

        # 6. Bulk insert new records
        if records_to_insert:
            db.bulk_save_objects(records_to_insert)
            
            # Save to history ledger
            history_record = POAttainmentHistory(
                batch_id=batch_uuid,
                course_id=course_id,
                calculated_by=user_id,
                notes=f"Calculated PO attainment for {len(records_to_insert)} records."
            )
            db.add(history_record)
            
            db.commit()

        return {
            "status": "success", 
            "batch_id": batch_uuid, 
            "records_processed": len(records_to_insert)
        }
