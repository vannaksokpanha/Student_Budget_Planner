const Category = require('../models/Category');

// GET /api/categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { user_id: req.user.id },
      order: [['name', 'ASC']]
    });
    return res.json(categories);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', detail: err.message });
  }
};

// POST /api/categories
const addCategory = async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const { color } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const userId = req.user.id;
    const existing = await Category.findOne({ where: { user_id: userId, name } });
    if (existing) {
      return res.status(409).json({ message: 'A category with that name already exists' });
    }

    const category = await Category.create({
      user_id: userId,
      name,
      color: color || '#6B7280'
    });

    return res.status(201).json(category);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', detail: err.message });
  }
};

// DELETE /api/categories/:id
// Expenses/presets tagged with this category fall back to "uncategorized" (category_id = null)
// via the SET NULL association, they are not deleted.
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findOne({ where: { category_id: id, user_id: req.user.id } });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    await category.destroy();
    return res.json({ message: 'Deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', detail: err.message });
  }
};

module.exports = { getCategories, addCategory, deleteCategory };
