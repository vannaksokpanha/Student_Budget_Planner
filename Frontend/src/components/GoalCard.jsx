import React from 'react';

export default function GoalCard({ goal, index, onOpenModal, onDelete }) {
  return (
    <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', width: '250px' }}>
      {/* Handled sequentially using the page's loop counter */}
      <h3>Goal #{index + 1}: {goal.goal_name}</h3>
      
      <p>Target: <strong>${goal.target_amount}</strong></p>
      <p>Saved: <strong style={{ color: 'green' }}>${goal.current_amount}</strong></p>

      <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
        {/* These trigger the parent page's functions */}
        <button onClick={() => onOpenModal(goal, 'add')}>➕ Add</button>
        <button onClick={() => onOpenModal(goal, 'deduct')}>➖ Deduct</button>
        <button 
          onClick={() => onDelete(goal.goal_id)} 
          style={{ backgroundColor: '#ff4d4d', color: 'white', marginLeft: 'auto', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          🗑️
        </button>
      </div>
    </div>
  );
}