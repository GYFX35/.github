# This file will contain data models.
# For Phase 1, we are using simple Python classes and in-memory storage.
# In later phases, these could be SQLAlchemy models or similar for database persistence.

from dataclasses import dataclass, field
from datetime import date
from typing import Optional, List

# In-memory storage for Phase 1
# These will be lists of dataclass instances.
# This is a simple approach; for a real application, especially with multiple users
# or persistent data needs, a database would be essential.
# We'll manage these lists within the app context or a dedicated service module later.
# For now, defining the structures.

# Global lists to store data for Phase 1 - this is a simplification.
# A better approach would be to manage this within the Flask app context
# or a dedicated data service to avoid global state issues,
# especially with web server Gunicorn workers.
# However, for the simplicity of Phase 1, we'll start here and refine if needed.
# These will be populated by the CSV upload functions.
# It's better to initialize these in app.py or a service layer.
# For now, just defining the models.

@dataclass
class AffiliatePerformanceData:
    """Represents performance data for an affiliate for a specific period."""
    report_date: date
    affiliate_name: str
    impressions: Optional[int] = None
    clicks: Optional[int] = None
    conversions: Optional[int] = None
    commission_amount: Optional[float] = None

    @property
    def epc(self) -> Optional[float]:
        """Earnings Per Click."""
        if self.clicks and self.clicks > 0 and self.commission_amount is not None:
            return round(self.commission_amount / self.clicks, 2)
        return None

@dataclass
class AdCampaignPerformanceData:
    """Represents performance data for an ad campaign for a specific period."""
    report_date: date
    campaign_name: str
    platform: Optional[str] = None # e.g., Google Ads, Facebook Ads
    impressions: Optional[int] = None
    clicks: Optional[int] = None
    cost: Optional[float] = None
    conversions: Optional[int] = None
    # Potentially add more fields as needed, like spend, revenue for ROAS etc.

    @property
    def ctr(self) -> Optional[float]:
        """Click-Through Rate."""
        if self.impressions and self.impressions > 0 and self.clicks is not None:
            return round((self.clicks / self.impressions) * 100, 2)
        return None

    @property
    def cpc(self) -> Optional[float]:
        """Cost Per Click."""
        if self.clicks and self.clicks > 0 and self.cost is not None:
            return round(self.cost / self.clicks, 2)
        return None

    @property
    def cpa(self) -> Optional[float]:
        """Cost Per Acquisition/Conversion."""
        if self.conversions and self.conversions > 0 and self.cost is not None:
            return round(self.cost / self.conversions, 2)
        return None

    # ROAS (Return on Ad Spend) would require revenue data, which is not included yet.
    # If revenue is added:
    # revenue: Optional[float] = None
    # @property
    # def roas(self) -> Optional[float]:
    #     if self.cost and self.cost > 0 and self.revenue is not None:
    #         return round(self.revenue / self.cost, 2)
    #     return None

# For Phase 1, we'll manage lists of these objects globally or within app context.
# Example:
# affiliate_data_store: List[AffiliatePerformanceData] = []
# ad_campaign_data_store: List[AdCampaignPerformanceData] = []
# These actual store initializations will be handled in the main app or service layer.
