const express = require("express");
const router = express.Router();
const sequelize = require('../config/database.js'); 
const { DataTypes } = require('sequelize');
const { SavingGoal } = require('../models/SavingGoal');

const get_Goals = async (req, res) => {
    try {
        const goals = await SavingGoal.findAll();
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
        const { user_id, goal_name, target_amount, target_date } = req.body;

        if (!user_id || !goal_name || target_amount){
            return res.status(400).json({error: "user_id, goal_name and target_amount are all required fields"});
        }

        const newGoal = await SavingGoal.create({
            user_id,
            goal_name,
            target_amount,
            current_amount: 0.00, // Matches your model default
            target_date
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

        const goal = await SavingGoal.findByPk(id);

        if (!goal) {
            return res.status(404).json({error: "Goal not found."})
        }

        let updatedBalance = Number(goal.current_amount) + Number(amount);
        if (updatedBalance < 0) updatedBalance = 0.00;
        await goal.update({ current_amount: updatedBalance});
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
        const goal = await SavingGoal.FindByPk(id);

        if (!goal) {
            return res.status(404).json({ error:"Goal not found."})
        }

        await goal.destroy();
        return res.status(200).json({ message: "Goal successfullyy deleted." });
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
