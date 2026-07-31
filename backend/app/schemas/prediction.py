from pydantic import BaseModel


class PredictionResponse(BaseModel):
    overallRisk: int
    confidence: int
    spiral: int
    handwriting: int
    motion: int
    riskLevel: str
