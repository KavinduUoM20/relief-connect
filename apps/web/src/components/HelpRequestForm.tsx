import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { ICreateHelpRequest } from '@nx-mono-repo-deployment-test/shared/src/interfaces/help-request/ICreateHelpRequest';
import {
  Urgency,
  ContactType,
} from '@nx-mono-repo-deployment-test/shared/src/enums';
import LocationPicker from './LocationPicker';
import styles from '../styles/Form.module.css';

interface HelpRequestFormProps {
  onSubmit: (data: ICreateHelpRequest) => Promise<void>;
  onCancel?: () => void;
}

const HelpRequestForm: React.FC<HelpRequestFormProps> = ({ onSubmit, onCancel }) => {
  const { t } = useTranslation('common');
  const [formData, setFormData] = useState<Partial<ICreateHelpRequest>>({
    urgency: Urgency.MEDIUM,
    contactType: ContactType.NONE,
    shortNote: '',
    approxArea: '',
    lat: 7.8731,
    lng: 80.7718,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLocationChange = (lat: number, lng: number) => {
    setFormData({ ...formData, lat, lng });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.shortNote || formData.shortNote.trim().length === 0) {
      setError(t('shortNoteIsRequired'));
      return;
    }
    if (formData.shortNote.length > 160) {
      setError(t('shortNoteMaxLength', { max: 160 }));
      return;
    }
    if (!formData.approxArea || formData.approxArea.trim().length === 0) {
      setError(t('approximateAreaIsRequired'));
      return;
    }
    if (formData.contactType !== ContactType.NONE && !formData.contact) {
      setError(t('contactInfoRequired'));
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData as ICreateHelpRequest);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('failedToSubmitHelpRequest'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>{t('iNeedHelp')}</h2>

      <div className={styles.formGroup}>
        <label htmlFor="urgency">{t('urgency')} *</label>
        <select
          id="urgency"
          value={formData.urgency}
          onChange={(e) => setFormData({ ...formData, urgency: e.target.value as Urgency })}
          required
        >
          {Object.values(Urgency).map((urg) => (
            <option key={urg} value={urg}>
              {urg}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="shortNote">{t('shortNote')} (max 160 {t('chars')}) *</label>
        <textarea
          id="shortNote"
          value={formData.shortNote}
          onChange={(e) => setFormData({ ...formData, shortNote: e.target.value })}
          maxLength={160}
          rows={3}
          required
        />
        <small>{formData.shortNote?.length || 0}/160 {t('characters')}</small>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="approxArea">{t('approximateArea')} *</label>
        <input
          id="approxArea"
          type="text"
          value={formData.approxArea}
          onChange={(e) => setFormData({ ...formData, approxArea: e.target.value })}
          placeholder={t('approximateAreaPlaceholder')}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="contactType">{t('contactType')} *</label>
        <select
          id="contactType"
          value={formData.contactType}
          onChange={(e) => {
            const contactType = e.target.value as ContactType;
            setFormData({
              ...formData,
              contactType,
              contact: contactType === ContactType.NONE ? undefined : formData.contact,
            });
          }}
          required
        >
          {Object.values(ContactType).map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {formData.contactType !== ContactType.NONE && (
        <div className={styles.formGroup}>
          <label htmlFor="contact">{t('contact')} *</label>
          <input
            id="contact"
            type="text"
            value={formData.contact || ''}
            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
            placeholder="Phone or WhatsApp number"
            required
          />
        </div>
      )}

      <div className={styles.formGroup}>
        <label>{t('location')} *</label>
        <LocationPicker
          onLocationChange={handleLocationChange}
          initialLat={formData.lat}
          initialLng={formData.lng}
        />
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.formActions}>
        {onCancel && (
          <button type="button" onClick={onCancel} className={styles.cancelButton}>
            {t('cancel')}
          </button>
        )}
        <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
          {isSubmitting ? t('processing') : t('submit')}
        </button>
      </div>
    </form>
  );
};

export default HelpRequestForm;

