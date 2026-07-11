const crypto = require('crypto');
const BudgetGroup = require('../models/BudgetGroup');
const BudgetGroupMember = require('../models/BudgetGroupMember');
const Expense = require('../models/Expense');
const ExpenseItem = require('../models/ExpenseItem');
const User = require('../models/User');
const sequelize = require('../config/database');
const GROUP_EXPENSE_TYPE = 'Group Expense';
const STATUS_OPTIONS = ['Paid', 'Pending'];
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const findMembership = (userId, groupId) => {
    return BudgetGroupMember.findOne({ where: { user_id: userId, group_id: groupId } });
};

const getGroups = async (req, res) => {
    try {
        const memberships = await BudgetGroupMember.findAll({
            where: { user_id: req.user.id },
            include: { model: BudgetGroup }
        })
        const groups = await Promise.all(memberships.map(async (membership) => {
            const group = membership.BudgetGroup;
            const groupId = group.group_id;

            const [currentAmount, contributorCount, owner] = await Promise.all([
                Expense.sum('amount', {
                    where: {
                        group_id: groupId,
                        expense_type: GROUP_EXPENSE_TYPE
                    },
                }),
                BudgetGroupMember.count({
                    where: { group_id: groupId }
                }),
                BudgetGroupMember.findOne({
                    where: {
                        group_id: groupId,
                        member_role: 'owner'
                    },
                    include: { model: User }
                })
            ]);

            const targetAmount = Number(group.group_budget) || 0;
            const total = currentAmount || 0;

            return {
                id: groupId,
                name: group.title,
                token: group.token,
                createdBy: owner?.User?.name ?? null,
                myRole: membership.member_role,
                targetAmount,
                currentAmount: total,
                progress: targetAmount > 0 ? Math.min(100, Math.round((total / targetAmount) * 100)) : 0,
                contributorCount,
                avgPerPerson: contributorCount > 0 ? total / contributorCount : 0
            }
        }))

        return res.json(groups)
    }
    catch (err) {
        console.error(err)
        res.status(500).json({
            message: "Server Error!!! We'll update after maintaining it"
        })
    }
}
const handleCreateGroup = async (req, res) => {
    try {
      const { title, targetAmount } = req.body;
      const trimmedTitle = title?.trim();
      const amount = Number(targetAmount);

      if (!trimmedTitle) {
        return res.status(400).json({ message: 'Group name is required' });
      }
      if (!Number.isFinite(amount) || amount < 0) {
        return res.status(400).json({ message: 'Target amount must be a positive number' });
      }

      const newGroup = await sequelize.transaction(async (t) => {
        const group = await BudgetGroup.create({
            title: trimmedTitle,
            group_budget: amount,
            token: crypto.randomBytes(16).toString('hex')
        }, { transaction: t });

        await BudgetGroupMember.create({
            user_id: req.user.id,
            group_id: group.group_id,
            member_role: "owner"
        }, { transaction: t });

        return group;
      });

      const owner = await User.findByPk(req.user.id, { attributes: ['name'] });

      return res.status(201).json({
        id: newGroup.group_id,
        name: newGroup.title,
        token: newGroup.token,
        createdBy: owner?.name ?? null,
        myRole: 'owner',
        targetAmount: amount,
        currentAmount: 0,
        progress: 0,
        contributorCount: 1,
        avgPerPerson: 0
      });
    }
    catch(err){
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
  };

const joinGroup = async (req, res) => {
    try {
        const token = req.body.token?.trim();
        if (!token) {
            return res.status(400).json({ message: 'Invite token is required' });
        }

        const group = await BudgetGroup.findOne({ where: { token } });
        if (!group) {
            return res.status(404).json({ message: 'Invalid invite link' });
        }
        const tokenAgeMs = Date.now() - new Date(group.token_created_at).getTime();
        if (tokenAgeMs > ONE_DAY_MS) {
            return res.status(410).json({ message: 'This invite link has expired' });
        }

        const existing = await findMembership(req.user.id, group.group_id);
        if (existing) {
            return res.status(409).json({ message: 'You are already in this group' });
        }

        await BudgetGroupMember.create({
            user_id: req.user.id,
            group_id: group.group_id,
            member_role: 'member'
        });

        const [currentAmount, contributorCount, owner] = await Promise.all([
            Expense.sum('amount', { where: { group_id: group.group_id, expense_type: GROUP_EXPENSE_TYPE } }),
            BudgetGroupMember.count({ where: { group_id: group.group_id } }),
            BudgetGroupMember.findOne({ where: { group_id: group.group_id, member_role: 'owner' }, include: { model: User } })
        ]);

        const targetAmount = Number(group.group_budget) || 0;
        const total = currentAmount || 0;

        return res.status(201).json({
            id: group.group_id,
            name: group.title,
            token: group.token,
            createdBy: owner?.User?.name ?? null,
            myRole: 'member',
            targetAmount,
            currentAmount: total,
            progress: targetAmount > 0 ? Math.min(100, Math.round((total / targetAmount) * 100)) : 0,
            contributorCount,
            avgPerPerson: contributorCount > 0 ? total / contributorCount : 0
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

const getGroupExpenses = async (req, res) => {
    try {
        const { groupId } = req.params;

        const membership = await findMembership(req.user.id, groupId);
        if (!membership) {
            return res.status(403).json({ message: 'You are not a member of this group' });
        }

        const rows = await Expense.findAll({
            where: { group_id: groupId, expense_type: GROUP_EXPENSE_TYPE },
            include: [{ model: User, attributes: ['id', 'name'] }],
            order: [['expense_date', 'DESC'], ['expense_id', 'DESC']]
        });

        const contributions = rows.map((row) => ({
            id: row.expense_id,
            groupId: row.group_id,
            contributorId: row.user_id,
            contributorName: row.User?.name ?? 'Unknown',
            date: row.expense_date,
            reason: row.expense_description || 'Contribution',
            amount: parseFloat(row.amount),
            status: row.contribution_status
        }));

        return res.json(contributions);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Only the group owner adds contribution entries — regular members can't add
// their own here. What a member CAN do is add itemized spending underneath
// a contribution that's already theirs (see addExpenseItem below).
const addContribution = async (req, res) => {
    try {
        const { groupId } = req.params;
        const amount = Number(req.body.amount);
        const reason = req.body.reason?.trim();
        const status = req.body.status || 'Paid';

        const membership = await findMembership(req.user.id, groupId);
        if (!membership || membership.member_role !== 'owner') {
            return res.status(403).json({ message: 'Only the group owner can add a contribution' });
        }
        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({ message: 'Amount must be a positive number' });
        }
        if (!req.body.userId) {
            return res.status(400).json({ message: 'Contributor is required' });
        }
        if (!STATUS_OPTIONS.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const targetMembership = await findMembership(req.body.userId, groupId);
        if (!targetMembership) {
            return res.status(404).json({ message: 'That member is not in this group' });
        }
        const contributorId = Number(req.body.userId);

        const expense = await Expense.create({
            user_id: contributorId,
            group_id: groupId,
            amount,
            expense_description: reason || null,
            expense_type: GROUP_EXPENSE_TYPE,
            contribution_status: status
        });

        const user = await User.findByPk(contributorId, { attributes: ['name'] });

        return res.status(201).json({
            id: expense.expense_id,
            groupId: expense.group_id,
            contributorId: expense.user_id,
            contributorName: user?.name ?? 'Unknown',
            date: expense.expense_date,
            reason: expense.expense_description || 'Contribution',
            amount: parseFloat(expense.amount),
            status: expense.contribution_status
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

const leaveGroup = async (req, res) => {
    try {
        const { groupId } = req.params;

        const membership = await findMembership(req.user.id, groupId);
        if (!membership) {
            return res.status(404).json({ message: 'You are not a member of this group' });
        }
        if (membership.member_role === 'owner') {
            return res.status(400).json({ message: "As the owner, you can't leave this group" });
        }

        await membership.destroy();
        return res.json({ message: 'Left group' });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

const getGroupMembers = async (req, res) => {
    try {
        const { groupId } = req.params;

        const membership = await findMembership(req.user.id, groupId);
        if (!membership) {
            return res.status(403).json({ message: 'You are not a member of this group' });
        }

        const members = await BudgetGroupMember.findAll({
            where: { group_id: groupId },
            include: { model: User },
            order: [['member_role', 'ASC'], ['joined_at', 'ASC']]
        });

        return res.json(members.map((m) => ({
            userId: m.user_id,
            name: m.User?.name ?? 'Unknown',
            role: m.member_role,
            joinedAt: m.joined_at
        })));
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

const removeMember = async (req, res) => {
    try {
        const { groupId, userId } = req.params;

        const requesterMembership = await findMembership(req.user.id, groupId);
        if (!requesterMembership || requesterMembership.member_role !== 'owner') {
            return res.status(403).json({ message: 'Only the group owner can remove members' });
        }
        if (Number(userId) === req.user.id) {
            return res.status(400).json({ message: 'Use "leave group" to remove yourself' });
        }

        const targetMembership = await findMembership(userId, groupId);
        if (!targetMembership) {
            return res.status(404).json({ message: 'Member not found' });
        }

        // Their contributions leave with them, so the group total doesn't
        // keep counting money from someone no longer in the group.
        await sequelize.transaction(async (t) => {
            await Expense.destroy({
                where: { group_id: groupId, user_id: userId, expense_type: GROUP_EXPENSE_TYPE },
                transaction: t
            });
            await targetMembership.destroy({ transaction: t });
        });

        return res.json({ message: 'Member removed' });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Any group member can view what a contribution was spent on.
const getExpenseItems = async (req, res) => {
    try {
        const { groupId, expenseId } = req.params;

        const membership = await findMembership(req.user.id, groupId);
        if (!membership) {
            return res.status(403).json({ message: 'You are not a member of this group' });
        }

        const expense = await Expense.findOne({
            where: { expense_id: expenseId, group_id: groupId, expense_type: GROUP_EXPENSE_TYPE }
        });
        if (!expense) {
            return res.status(404).json({ message: 'Contribution not found' });
        }

        const items = await ExpenseItem.findAll({
            where: { expense_id: expenseId },
            order: [['item_id', 'ASC']]
        });

        return res.json({
            contributorId: expense.user_id,
            reason: expense.expense_description,
            amount: parseFloat(expense.amount),
            items: items.map((i) => ({
                id: i.item_id,
                name: i.name,
                amount: i.amount !== null ? parseFloat(i.amount) : null
            }))
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Only the member who owns the contribution can itemize what they spent it on.
const addExpenseItem = async (req, res) => {
    try {
        const { groupId, expenseId } = req.params;
        const name = req.body.name?.trim();
        const amount = req.body.amount !== undefined && req.body.amount !== '' ? Number(req.body.amount) : null;

        const membership = await findMembership(req.user.id, groupId);
        if (!membership) {
            return res.status(403).json({ message: 'You are not a member of this group' });
        }

        const expense = await Expense.findOne({
            where: { expense_id: expenseId, group_id: groupId, expense_type: GROUP_EXPENSE_TYPE }
        });
        if (!expense) {
            return res.status(404).json({ message: 'Contribution not found' });
        }
        if (expense.user_id !== req.user.id) {
            return res.status(403).json({ message: 'You can only add items to your own contribution' });
        }
        if (!name) {
            return res.status(400).json({ message: 'Item name is required' });
        }
        if (amount !== null && (!Number.isFinite(amount) || amount < 0)) {
            return res.status(400).json({ message: 'Amount must be a positive number' });
        }

        const item = await ExpenseItem.create({ expense_id: expenseId, name, amount });

        return res.status(201).json({
            id: item.item_id,
            name: item.name,
            amount: item.amount !== null ? parseFloat(item.amount) : null
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Owner-only — removes a contribution entry entirely. Its itemized spending
// goes with it (cascades via the Expense -> ExpenseItem FK).
const deleteContribution = async (req, res) => {
    try {
        const { groupId, expenseId } = req.params;

        const membership = await findMembership(req.user.id, groupId);
        if (!membership || membership.member_role !== 'owner') {
            return res.status(403).json({ message: 'Only the group owner can remove a contribution' });
        }

        const expense = await Expense.findOne({
            where: { expense_id: expenseId, group_id: groupId, expense_type: GROUP_EXPENSE_TYPE }
        });
        if (!expense) {
            return res.status(404).json({ message: 'Contribution not found' });
        }

        await expense.destroy();
        return res.json({ message: 'Contribution removed' });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Same ownership rule as adding one — only the member whose contribution
// this is can remove an item from it.
const deleteExpenseItem = async (req, res) => {
    try {
        const { groupId, expenseId, itemId } = req.params;

        const membership = await findMembership(req.user.id, groupId);
        if (!membership) {
            return res.status(403).json({ message: 'You are not a member of this group' });
        }

        const expense = await Expense.findOne({
            where: { expense_id: expenseId, group_id: groupId, expense_type: GROUP_EXPENSE_TYPE }
        });
        if (!expense) {
            return res.status(404).json({ message: 'Contribution not found' });
        }
        if (expense.user_id !== req.user.id) {
            return res.status(403).json({ message: 'You can only remove items from your own contribution' });
        }

        const item = await ExpenseItem.findOne({ where: { item_id: itemId, expense_id: expenseId } });
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        await item.destroy();
        return res.json({ message: 'Item removed' });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Owner-only, permanent — deletes the group, its members, its contributions,
// and (via cascade) their itemized expenses. There's no undo.
const deleteGroup = async (req, res) => {
    try {
        const { groupId } = req.params;

        const membership = await findMembership(req.user.id, groupId);
        if (!membership || membership.member_role !== 'owner') {
            return res.status(403).json({ message: 'Only the group owner can delete this group' });
        }

        const group = await BudgetGroup.findByPk(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        await sequelize.transaction(async (t) => {
            await Expense.destroy({ where: { group_id: groupId, expense_type: GROUP_EXPENSE_TYPE }, transaction: t });
            await BudgetGroupMember.destroy({ where: { group_id: groupId }, transaction: t });
            await group.destroy({ transaction: t });
        });

        return res.json({ message: 'Group deleted' });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    findMembership,
    getGroups,
    handleCreateGroup,
    joinGroup,
    getGroupExpenses,
    addContribution,
    leaveGroup,
    getGroupMembers,
    removeMember,
    getExpenseItems,
    addExpenseItem,
    deleteGroup,
    deleteContribution,
    deleteExpenseItem
}