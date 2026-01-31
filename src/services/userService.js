const User = require('../database/userModel');

exports.updateUserProfile = async (req, res) => {
  const { name, profilePhoto } = req.body;
  const userId = req.user.id;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, profilePhoto },
      { new: true }
    );
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
};