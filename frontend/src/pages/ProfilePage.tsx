import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import {
  User,
  Mail,
  Building2,
  MapPin,
  Phone,
  Edit2,
  Save,
  X,
  Lock,
  Briefcase
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    department: user?.department || '',
    location: user?.location || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    institution: user?.institution || '',
    domain: user?.domain || ''
  });

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Mise à jour du profil via le contexte
      updateProfile({
        fullName: formData.fullName,
        department: formData.department,
        location: formData.location,
        phone: formData.phone,
        bio: formData.bio,
        institution: formData.institution,
        domain: formData.domain
      });

      setSuccess('Profil mis à jour avec succès !');
      setIsEditing(false);
    } catch (err) {
      setError('Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || '',
      email: user?.email || '',
      department: user?.department || '',
      location: user?.location || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      institution: user?.institution || '',
      domain: user?.domain || ''
    });
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  if (!user) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            backgroundColor: '#e5e7eb', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <User size={32} style={{ color: '#9ca3af' }} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
            Utilisateur non trouvé
          </h2>
          <p style={{ color: '#6b7280' }}>
            Veuillez vous connecter pour accéder à votre profil
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      backgroundColor: '#f8fafc', 
      minHeight: '100vh',
      padding: '24px'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937', marginBottom: '8px' }}>
                Mon Profil
              </h1>
              <p style={{ color: '#6b7280', fontSize: '16px' }}>
                Gérez vos informations personnelles
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '12px 20px',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 6px rgba(59, 130, 246, 0.2)',
                    transition: 'all 0.2s'
                  }}
                >
                  <Edit2 size={18} />
                  Modifier
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={loading}
                    style={{
                      backgroundColor: loading ? '#94a3b8' : '#10b981',
                      color: 'white',
                      padding: '12px 20px',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: loading ? 'none' : '0 4px 6px rgba(16, 185, 129, 0.2)',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Save size={18} />
                    {loading ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    style={{
                      backgroundColor: '#6b7280',
                      color: 'white',
                      padding: '12px 20px',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 6px rgba(107, 114, 128, 0.2)',
                      transition: 'all 0.2s'
                    }}
                  >
                    <X size={18} />
                    Annuler
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '14px',
              fontWeight: '500',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fecaca'
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '14px',
              fontWeight: '500',
              backgroundColor: '#f0fdf4',
              color: '#166534',
              border: '1px solid #bbf7d0'
            }}>
              {success}
            </div>
          )}

          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: '700',
              color: 'white'
            }}>
              {user.fullName.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                {user.fullName}
              </h2>
              <p style={{ color: '#6b7280', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Briefcase size={16} />
                {user.role === 'PROJECT_MANAGER' ? 'Chef de Projet' : 'Membre d\'Équipe'}
              </p>
            </div>
          </div>
        </div>

        {/* Informations Personnelles */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '24px' }}>
            Informations Personnelles
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {/* Nom complet */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                Nom complet
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              ) : (
                <div style={{ 
                  padding: '12px 16px', 
                  backgroundColor: '#f9fafb', 
                  borderRadius: '8px',
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <User size={16} style={{ color: '#9ca3af' }} />
                  {user.fullName}
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                Email
              </label>
              <div style={{ 
                padding: '12px 16px', 
                backgroundColor: '#f9fafb', 
                borderRadius: '8px',
                color: '#374151',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Mail size={16} style={{ color: '#9ca3af' }} />
                {user.email || 'Non renseigné'}
              </div>
            </div>

            {/* Département */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                Département
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Ex: Ingénierie, Marketing..."
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              ) : (
                <div style={{ 
                  padding: '12px 16px', 
                  backgroundColor: '#f9fafb', 
                  borderRadius: '8px',
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Building2 size={16} style={{ color: '#9ca3af' }} />
                  {user.department || 'Non renseigné'}
                </div>
              )}
            </div>

            {/* Localisation */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                Localisation
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Ex: Paris, France"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              ) : (
                <div style={{ 
                  padding: '12px 16px', 
                  backgroundColor: '#f9fafb', 
                  borderRadius: '8px',
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <MapPin size={16} style={{ color: '#9ca3af' }} />
                  {user.location || 'Non renseigné'}
                </div>
              )}
            </div>

            {/* Téléphone */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                Téléphone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Ex: +33 6 12 34 56 78"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              ) : (
                <div style={{ 
                  padding: '12px 16px', 
                  backgroundColor: '#f9fafb', 
                  borderRadius: '8px',
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Phone size={16} style={{ color: '#9ca3af' }} />
                  {user.phone || 'Non renseigné'}
                </div>
              )}
            </div>

            {/* Institution */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                Institution
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  placeholder="Ex: Entreprise XYZ"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              ) : (
                <div style={{ 
                  padding: '12px 16px', 
                  backgroundColor: '#f9fafb', 
                  borderRadius: '8px',
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Building2 size={16} style={{ color: '#9ca3af' }} />
                  {user.institution || 'Non renseigné'}
                </div>
              )}
            </div>
          </div>

          {/* Biographie */}
          <div style={{ marginTop: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Biographie
            </label>
            {isEditing ? (
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Parlez-vous brièvement..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '15px',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            ) : (
              <div style={{ 
                padding: '12px 16px', 
                backgroundColor: '#f9fafb', 
                borderRadius: '8px',
                color: '#374151',
                minHeight: '80px'
              }}>
                {user.bio || 'Aucune biographie renseignée'}
              </div>
            )}
          </div>
        </div>

        {/* Sécurité */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '24px' }}>
            Sécurité
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#fef3c7',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Lock size={24} style={{ color: '#f59e0b' }} />
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                  Mot de passe
                </h4>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                  Modifiez votre mot de passe régulièrement pour sécuriser votre compte
                </p>
              </div>
            </div>
            <Button
              style={{
                backgroundColor: '#f59e0b',
                color: 'white',
                padding: '10px 16px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Changer le mot de passe
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
