import React, { useState } from 'react';

function Wishlist({ wishlist, setWishlist }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Gjenstand');

  const handleAddWish = () => {
    if (!name) return;

    const newWish = {
      name,
      category,
      date: new Date().toISOString().split('T')[0],
    };

    setWishlist([...wishlist, newWish]);
    setName('');
    setCategory('Gjenstand');
  };

  return (
    <div>
      <h3>Legg til ønske</h3>
      <input
        type="text"
        placeholder="Hva ønsker du?"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option>Gjenstand</option>
        <option>Opplevelse</option>
        <option>Reise</option>
        <option>Annet</option>
      </select>
      <button onClick={handleAddWish}>Legg til</button>

      <h4>Ønskeliste</h4>
      <ul>
        {wishlist.map((wish, index) => (
          <li key={index}>
            {wish.name} ({wish.category})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Wishlist;
