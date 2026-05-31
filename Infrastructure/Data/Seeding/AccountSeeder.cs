using System.Globalization;
using CsvHelper;
using CsvHelper.Configuration;
using Microsoft.EntityFrameworkCore;
using Novologs.Domain.Entities;
using Novologs.Domain.Enums;

namespace Novologs.Infrastructure.Data.Seeding;

public static class AccountSeeder
{
    /// <summary>
    /// Seeds default Chart of Accounts from CSV file with 5-level hierarchy
    /// Imports 274 accounts from Chart_of_Accounts_with_GUIDs.csv
    /// </summary>
    public static async Task SeedDefaultChartOfAccountsAsync(ApplicationDbContext context, CancellationToken cancellationToken = default)
    {
        // Check if accounts already exist
        if (await context.Set<Account>().AnyAsync(cancellationToken))
        {
            return; // Already seeded
        }

        var accounts = new List<Account>();

        // Try multiple potential paths for the CSV file
        // First try container path (Docker runtime)
        var csvFilePath = Path.Combine("/app", "data", "Chart_of_Accounts_with_GUIDs.csv");

        // Fallback to development paths
        if (!File.Exists(csvFilePath))
        {
            csvFilePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "..", "..", "..", "Account", "docs", "Chart_of_Accounts_with_GUIDs.csv");
        }

        // Fallback to solution root
        if (!File.Exists(csvFilePath))
        {
            csvFilePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "..", "..", "Account", "docs", "Chart_of_Accounts_with_GUIDs.csv");
        }

        // Fallback to current directory
        if (!File.Exists(csvFilePath))
        {
            csvFilePath = Path.Combine(Directory.GetCurrentDirectory(), "Account", "docs", "Chart_of_Accounts_with_GUIDs.csv");
        }

        if (!File.Exists(csvFilePath))
        {
            throw new FileNotFoundException($"Chart of Accounts CSV file not found. Tried paths: /app/data/, Account/docs/");
        }

        using (var reader = new StreamReader(csvFilePath))
        using (var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            Delimiter = "\t", // TSV (Tab-Separated Values) file
            HeaderValidated = null,
            MissingFieldFound = null
        }))
        {
            var records = csv.GetRecords<CsvAccountRecord>().ToList();

            foreach (var record in records)
            {
                // Parse Account ID to determine AccountType and AccountCategory
                if (!int.TryParse(record.AccountID, out var accountCode))
                {
                    continue; // Skip invalid account codes
                }

                var accountType = GetAccountType(accountCode);
                var accountCategory = GetAccountCategory(accountCode, record.Level);

                // Parse GUIDs
                if (!Guid.TryParse(record.Guid, out var accountId))
                {
                    continue; // Skip invalid GUIDs
                }

                Guid? parentAccountId = null;
                if (!string.IsNullOrWhiteSpace(record.ParentIdGuid) && Guid.TryParse(record.ParentIdGuid, out var parsedParentId))
                {
                    parentAccountId = parsedParentId;
                }

                // Parse IsSubcategory
                var isSubcategory = record.IsSubcategory?.Trim().Equals("TRUE", StringComparison.OrdinalIgnoreCase) ?? false;

                var account = new Account(accountId)
                {
                    Code = record.AccountID,
                    Name = record.AccountName.Trim(),
                    AccountType = accountType,
                    AccountCategory = accountCategory,
                    Level = record.Level,
                    ParentAccountId = parentAccountId,
                    IsActive = true,
                    IsSubcategory = isSubcategory,
                    OpeningDebit = 0,
                    OpeningCredit = 0
                };

                accounts.Add(account);
            }
        }

        await context.Set<Account>().AddRangeAsync(accounts, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
    }

    private static AccountType GetAccountType(int accountCode)
    {
        var firstDigit = int.Parse(accountCode.ToString()[0].ToString());

        return firstDigit switch
        {
            1 => AccountType.Asset,
            2 => AccountType.Liability,
            3 => AccountType.Equity,
            4 => AccountType.Revenue,
            5 => AccountType.Expense,
            9 => AccountType.Control, // Control & Memorandum Accounts
            _ => AccountType.Asset // Default fallback
        };
    }

    private static AccountCategory GetAccountCategory(int accountCode, int level)
    {
        var firstDigit = int.Parse(accountCode.ToString()[0].ToString());
        var codeStr = accountCode.ToString().PadRight(5, '0');
        var first2Digits = int.Parse(codeStr.Substring(0, 2));

        // Generic category mapping based on account type ranges
        return firstDigit switch
        {
            1 => first2Digits switch // Assets
            {
                11 => AccountCategory.CurrentAsset,
                12 => AccountCategory.FixedAsset,
                _ => AccountCategory.CurrentAsset
            },
            2 => first2Digits switch // Liabilities
            {
                21 => AccountCategory.ShortTermLiability,
                22 => AccountCategory.LongTermLiability,
                _ => AccountCategory.ShortTermLiability
            },
            3 => first2Digits switch // Equity
            {
                31 => AccountCategory.OwnersEquity,
                32 => AccountCategory.RetainedEarnings,
                33 => AccountCategory.OwnersEquity, // Reserves → OwnersEquity
                34 => AccountCategory.OwnersEquity, // Drawings → OwnersEquity
                _ => AccountCategory.ShareCapital
            },
            4 => AccountCategory.OperatingRevenue, // All Revenue
            5 => first2Digits switch // Expenses
            {
                51 => AccountCategory.CostOfGoodsSold,
                52 => AccountCategory.OperatingExpense,
                53 => AccountCategory.NonOperatingExpense,
                _ => AccountCategory.OperatingExpense
            },
            9 => AccountCategory.CurrentAsset, // Control accounts - fallback to CurrentAsset
            _ => AccountCategory.CurrentAsset
        };
    }

    // CSV mapping class
    private class CsvAccountRecord
    {
        public string Id { get; set; } = string.Empty;

        [CsvHelper.Configuration.Attributes.Name("Account ID")]
        public string AccountID { get; set; } = string.Empty;

        [CsvHelper.Configuration.Attributes.Name("Account Name")]
        public string AccountName { get; set; } = string.Empty;

        [CsvHelper.Configuration.Attributes.Name("Parentid")]
        public string Parentid { get; set; } = string.Empty;

        [CsvHelper.Configuration.Attributes.Name("level")]
        public int Level { get; set; }

        [CsvHelper.Configuration.Attributes.Name("guid")]
        public string Guid { get; set; } = string.Empty;

        [CsvHelper.Configuration.Attributes.Name("parent_id_guid")]
        public string ParentIdGuid { get; set; } = string.Empty;

        [CsvHelper.Configuration.Attributes.Name("IsSubcategory")]
        public string? IsSubcategory { get; set; }
    }
}
