const { Op } = require('sequelize');
const SavingGoal = require('../models/SavingGoal');
const Expense = require('../models/Expense');
const { TYPES, todayString, monthRange, refreshBudget } = require('../utils/budgetMath');

// Savings deposits come out of this month's budget ("pay yourself first").
// The ledger is one 'Savings' expense row per goal per month holding the net
// amount deposited; the allowance math treats it like a bill. This keeps that
// row in sync with every add/withdraw.
const syncMonthlySavingsRow = async (userId, goal, adjustment) => {
  const [start, end] = monthRange();
  const row = await Expense.findOne({
    where: {
      user_id: userId,
      goal_id: goal.goal_id,
      expense_type: TYPES.SAVINGS,
      expense_date: { [Op.between]: [start, end] }
    }
  });

  if (adjustment > 0) {
    if (row) {
      await row.update({ amount: Number(row.amount) + adjustment });
    } else {
      await Expense.create({
        user_id: userId,
        goal_id: goal.goal_id,
        amount: adjustment,
        expense_description: `Savings · ${goal.goal_name}`,
        expense_date: todayString(),
        expense_type: TYPES.SAVINGS
      });
    }
  } else if (row) {
    // Withdrawal: release the reservation. Clamped at zero — withdrawing
    // money deposited in past months is a windfall this month's budget
    // simply absorbs as extra available money.
    const remaining = Math.max(0, Number(row.amount) + adjustment);
    if (remaining === 0) {
      await row.destroy();
    } else {
      await row.update({ amount: remaining });
    }
  }

  // Recompute and persist the allowance so every page shows fresh numbers
  await refreshBudget(userId);
};

const get_Goals = async (req, res) => {
    try {
        const goals = await SavingGoal.findAll({ where: { user_id: req.user.id } });
        return res.status(200).json(goals);

    } catch (error) {
        return res.status(500).json({
            error: "Failed to retrieve savings goals",
            message: error.message
        });
    }
}

const add_Goal = async (req, res) => {
    try {
        const { goal_name, target_amount, target_date, current_amount } = req.body;

        if (!goal_name || !target_amount){
            return res.status(400).json({error: "goal_name and target_amount are required fields"});
        }

        const newGoal = await SavingGoal.create({
            user_id: req.user.id,
            goal_name,
            target_amount,
            current_amount: Number(current_amount) || 0.00,
            target_date: target_date || null
        })

        return res.status(201).json(newGoal);

    } catch (error) {
        return res.status(500).json({ 
            error:"Failed to create goal",
            detail: error.message
        })
    }
} 

const update_Savings = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount } = req.body;

        if (amount === undefined){
            return res.status(400).json({ error: "Adjustment amount is required."})
        }

        const goal = await SavingGoal.findOne({ where: { goal_id: id, user_id: req.user.id } });

        if (!goal) {
            return res.status(404).json({error: "Goal not found."})
        }

        const adjustment = Number(amount);

        // A withdrawal can never exceed what the goal actually holds
        if (adjustment < 0 && Math.abs(adjustment) > Number(goal.current_amount)) {
            return res.status(400).json({
                error: `You only have $${Number(goal.current_amount).toFixed(2)} saved in this goal.`
            });
        }

        await goal.update({ current_amount: Number(goal.current_amount) + adjustment });

        // Mirror the change into this month's budget reservation
        await syncMonthlySavingsRow(req.user.id, goal, adjustment);

        return res.status(200).json(goal);

    } catch (error) {
        return res.status(500).json({ 
            error: "Failed to update goal.",
            detail: error.message
        })
    }
}

const delete_Goal = async (req, res) => {
    try {
        const { id } = req.params;
        const goal = await SavingGoal.findOne({ where: { goal_id: id, user_id: req.user.id } });

        if (!goal) {
            return res.status(404).json({ error:"Goal not found."})
        }

        // Clean up the goal's savings ledger rows; dropping this month's row
        // hands its reservation back to the budget
        await Expense.destroy({
            where: { user_id: req.user.id, goal_id: goal.goal_id, expense_type: TYPES.SAVINGS }
        });
        await goal.destroy();
        await refreshBudget(req.user.id);

        return res.status(200).json({ message: "Goal successfully deleted." });
    } catch (error) {
        return res.status(500).json({
            error: "Failed to delete goal.",
            message: error.message
        })
    }
}

module.exports={
    get_Goals,
    add_Goal,
    delete_Goal,
    update_Savings
};
