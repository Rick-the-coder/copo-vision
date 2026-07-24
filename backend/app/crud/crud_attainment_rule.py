from app.crud.base import CRUDBase
from app.models.attainment_rule import AttainmentRule
from app.schemas.attainment_rule import AttainmentRuleCreate, AttainmentRuleUpdate

class CRUDAttainmentRule(CRUDBase[AttainmentRule, AttainmentRuleCreate, AttainmentRuleUpdate]):
    pass

attainment_rule = CRUDAttainmentRule(AttainmentRule)
