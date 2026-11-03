import type {
  ImportExpenseHead,
  ImportItem,
  ImportShipment,
} from "./import.types";

export function calculateLandedCosts(
  items: Omit<ImportItem, "allocatedExpense" | "totalLandedCost" | "landedUnitCost">[],
  expenseHeads: ImportExpenseHead[]
): ImportItem[] {
  const totalProductCost = items.reduce(
    (sum, item) => sum + item.purchaseTotalCost,
    0
  );
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return items.map((item) => {
    let itemAllocated = 0;

    for (const expense of expenseHeads) {
      if (expense.amount <= 0) continue;

      let ratio = 0;
      if (expense.allocationMethod === "BY_VALUE") {
        ratio = totalProductCost > 0 ? item.purchaseTotalCost / totalProductCost : 0;
      } else if (expense.allocationMethod === "BY_QUANTITY") {
        ratio = totalQuantity > 0 ? item.quantity / totalQuantity : 0;
      } else {
        ratio = items.length > 0 ? 1 / items.length : 0;
      }

      itemAllocated += expense.amount * ratio;
    }

    const totalLanded = item.purchaseTotalCost + itemAllocated;
    const landedUnit = item.quantity > 0 ? totalLanded / item.quantity : 0;

    return {
      ...item,
      allocatedExpense: Number(itemAllocated.toFixed(2)),
      totalLandedCost: Number(totalLanded.toFixed(2)),
      landedUnitCost: Number(landedUnit.toFixed(2)),
    };
  });
}

export const initialImports: ImportShipment[] = [];
