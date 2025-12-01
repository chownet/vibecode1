import { useState } from 'react';

function CreateAuction({ onCreate, user, isConnected, walletAddress }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    startingPrice: '',
    durationMinutes: '60',
    autoAcceptPrice: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!isConnected || !walletAddress) {
      alert('Please connect your wallet first to create an auction');
      return;
    }

    if (!formData.title || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    onCreate({
      title: formData.title,
      description: formData.description,
      imageUrl: formData.imageUrl || null,
      startingPrice: parseFloat(formData.startingPrice) || 0,
      durationMinutes: parseInt(formData.durationMinutes) || 60,
      autoAcceptPrice: formData.autoAcceptPrice ? parseFloat(formData.autoAcceptPrice) : null
    });

    // Reset form
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      startingPrice: '',
      durationMinutes: '60',
      autoAcceptPrice: ''
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isConnected) {
    return (
      <div className="create-auction">
        <div className="connect-prompt-large">
          <p>Please connect your wallet to create an auction</p>
        </div>
      </div>
    );
  }

  return (
    <div className="create-auction">
      <h2>Create New Auction</h2>
      <form onSubmit={handleSubmit} className="auction-form">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Rare NFT Collection"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe what you're auctioning..."
            rows="4"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="imageUrl">Image URL (optional)</label>
          <input
            type="url"
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startingPrice">Starting Price (USDC)</label>
            <input
              type="number"
              id="startingPrice"
              name="startingPrice"
              value={formData.startingPrice}
              onChange={handleChange}
              step="0.01"
              min="0"
              placeholder="0.01"
            />
          </div>

          <div className="form-group">
            <label htmlFor="durationMinutes">Duration</label>
            <select
              id="durationMinutes"
              name="durationMinutes"
              value={formData.durationMinutes}
              onChange={handleChange}
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
              <option value="240">4 hours</option>
              <option value="480">8 hours</option>
              <option value="1440">24 hours</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="autoAcceptPrice">
            Auto-Accept Price (USDC) 
            <span className="field-hint">(optional - auction closes immediately when this price is reached)</span>
          </label>
          <input
            type="number"
            id="autoAcceptPrice"
            name="autoAcceptPrice"
            value={formData.autoAcceptPrice}
            onChange={handleChange}
            step="0.01"
            min="0"
            placeholder="Leave empty for time-based only"
          />
        </div>

        <button type="submit" className="create-button">
          Create Auction
        </button>
      </form>
    </div>
  );
}

export default CreateAuction;

