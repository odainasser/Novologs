namespace Novologs.Domain.Enums;

public enum AccountCategory
{
    // Asset Categories
    CurrentAsset = 1,
    FixedAsset = 2,
    IntangibleAsset = 3,
    
    // Liability Categories
    ShortTermLiability = 10,
    LongTermLiability = 11,
    
    // Equity Categories
    ShareCapital = 20,
    RetainedEarnings = 21,
    OwnersEquity = 22,
    
    // Revenue Categories
    OperatingRevenue = 30,
    NonOperatingRevenue = 31,
    
    // Expense Categories
    OperatingExpense = 40,
    NonOperatingExpense = 41,
    CostOfGoodsSold = 42
}
