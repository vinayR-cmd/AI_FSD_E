const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const { protect } = require('../middleware/auth');

// POST /api/employees - Add employee
router.post('/', protect, async (req, res, next) => {
  try {
    const { name, email, department, skills, performanceScore, experience } = req.body;
    if (!name || !email || !department || !skills || performanceScore === undefined || experience === undefined) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    const employee = new Employee({ name, email, department, skills, performanceScore, experience });
    await employee.save();
    res.status(201).json({ message: 'Employee added successfully', employee });
  } catch (err) {
    next(err);
  }
});

// GET /api/employees - Get all employees
router.get('/', protect, async (req, res, next) => {
  try {
    const employees = await Employee.find().sort({ performanceScore: -1 });
    res.json({ total: employees.length, employees });
  } catch (err) {
    next(err);
  }
});

// GET /api/employees/search - Search by department, skill, name
router.get('/search', protect, async (req, res, next) => {
  try {
    const { department, skill, name } = req.query;
    let query = {};
    if (department) query.department = { $regex: department, $options: 'i' };
    if (skill) query.skills = { $regex: skill, $options: 'i' };
    if (name) query.name = { $regex: name, $options: 'i' };
    const employees = await Employee.find(query).sort({ performanceScore: -1 });
    res.json({ total: employees.length, employees });
  } catch (err) {
    next(err);
  }
});

// PUT /api/employees/:id - Update performance score
router.put('/:id', protect, async (req, res, next) => {
  try {
    const { performanceScore } = req.body;
    if (performanceScore === undefined) {
      return res.status(400).json({ error: 'performanceScore is required.' });
    }
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { performanceScore },
      { new: true, runValidators: true }
    );
    if (!employee) return res.status(404).json({ error: 'Employee not found.' });
    res.json({ message: 'Performance score updated', employee });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/employees/:id - Delete employee
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Employee not found.' });
    res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
