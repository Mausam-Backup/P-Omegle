import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Sliders, Camera, Mic, Volume2 } from 'lucide-react';

export function DeviceSettingsModal() {
  const { isSettingsModalOpen, setIsSettingsModalOpen } = useAuth();
  const [videoDevices, setVideoDevices] = useState([]);
  const [audioDevices, setAudioDevices] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState('');
  const [selectedAudio, setSelectedAudio] = useState('');

  useEffect(() => {
    if (isSettingsModalOpen && navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then(devices => {
        const vList = devices.filter(d => d.kind === 'videoinput');
        const aList = devices.filter(d => d.kind === 'audioinput');
        setVideoDevices(vList);
        setAudioDevices(aList);
        if (vList.length > 0 && !selectedVideo) setSelectedVideo(vList[0].deviceId);
        if (aList.length > 0 && !selectedAudio) setSelectedAudio(aList[0].deviceId);
      }).catch(err => console.warn('Device enum error', err));
    }
  }, [isSettingsModalOpen]);

  if (!isSettingsModalOpen) return null;

  return (
    <div className="modal-backdrop" onClick={() => setIsSettingsModalOpen(false)}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <Sliders size={20} color="#6366f1" />
            <h3 className="modal-heading">Audio & Video Settings</h3>
          </div>
          <button className="modal-close-icon-btn" onClick={() => setIsSettingsModalOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body-form">
          {/* Camera Picker */}
          <div className="form-field-group">
            <label className="field-label">
              <Camera size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              Camera Source
            </label>
            <select
              className="field-input"
              value={selectedVideo}
              onChange={(e) => setSelectedVideo(e.target.value)}
            >
              {videoDevices.length > 0 ? (
                videoDevices.map((d, i) => (
                  <option key={d.deviceId || i} value={d.deviceId}>
                    {d.label || `Camera ${i + 1}`}
                  </option>
                ))
              ) : (
                <option value="">Default Web Camera</option>
              )}
            </select>
          </div>

          {/* Microphone Picker */}
          <div className="form-field-group">
            <label className="field-label">
              <Mic size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              Microphone Input
            </label>
            <select
              className="field-input"
              value={selectedAudio}
              onChange={(e) => setSelectedAudio(e.target.value)}
            >
              {audioDevices.length > 0 ? (
                audioDevices.map((d, i) => (
                  <option key={d.deviceId || i} value={d.deviceId}>
                    {d.label || `Microphone ${i + 1}`}
                  </option>
                ))
              ) : (
                <option value="">Default Microphone</option>
              )}
            </select>
          </div>

          <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="primary-submit-btn"
              onClick={() => setIsSettingsModalOpen(false)}
            >
              Apply Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
