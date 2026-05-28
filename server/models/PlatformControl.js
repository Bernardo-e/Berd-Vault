const mongoose = require('mongoose');

const platformControlSchema = new mongoose.Schema({
  maintenanceMode: { type: Boolean, default: false },
  studentUploadsEnabled: { type: Boolean, default: true },
  staffAnnouncementsEnabled: { type: Boolean, default: true },
  examModeBoostEnabled: { type: Boolean, default: true },
  autoApproveStaffUploads: { type: Boolean, default: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('PlatformControl', platformControlSchema);
