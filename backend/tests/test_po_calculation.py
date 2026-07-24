from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_po_calculate_unauthorized():
    response = client.post(
        "/api/v1/co-engine/calculate",
        json={"course_id": 1}
    )
    # Should be 401 because we didn't provide a token
    assert response.status_code == 401

# The PO Math Engine uses the following formula:
# PO = Sum(CO Attainment * Correlation Weight) / Sum(Correlation Weight)
# 
# Real integration testing would require:
# 1. Seeding POConfiguration (Target = 70%)
# 2. Seeding COPOMapping (CO1->PO1=3, CO2->PO1=1)
# 3. Seeding COAttainment (Student A: CO1=80%, CO2=60%)
# 4. Result: PO1 = (80*3 + 60*1) / 4 = 300 / 4 = 75%
# 5. Attainment Level = Level 3 (since 75% >= 70%)
# This file validates the endpoint surface exists and requires auth.
