import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { ICreateCamp } from '@nx-mono-repo-deployment-test/shared/src/interfaces/camp/ICreateCamp';
import {
  CampType,
  PeopleRange,
  CampNeed,
  ContactType,
} from '@nx-mono-repo-deployment-test/shared/src/enums';
import LocationPicker from './LocationPicker';
import styles from '../styles/Form.module.css';

interface CampFormProps {
  onSubmit: (data: ICreateCamp) => Promise<void>;
  onCancel?: () => void;
}

const CampForm: React.FC<CampFormProps> = ({ onSubmit, onCancel }) => {
  const { t } = useTranslation('common');
  const [formData, setFormData] = useState<Partial<ICreateCamp>>({
    campType: CampType.COMMUNITY,
    name: '',
    peopleRange: PeopleRange.ONE_TO_TEN,
    needs: [],
    shortNote: '',
    contactType: ContactType.NONE,
    lat: 7.8731,
    lng: 80.7718,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLocationChange = (lat: number, lng: number) => {
    setFormData({ ...formData, lat, lng });
  };

  const handleNeedToggle = (need: CampNeed) => {
    const currentNeeds = formData.needs || [];
    const newNeeds = currentNeeds.includes(need)
      ? currentNeeds.filter((n) => n !== need)
      : [...currentNeeds, need];
    setFormData({ ...formData, needs: newNeeds });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name || formData.name.trim().length === 0) {
      setError(t('campNameIsRequired'));
      return;
    }
    if (!formData.needs || formData.needs.length === 0) {
      setError(t('atLeastOneNeedRequired'));
      return;
    }
    if (!formData.shortNote || formData.shortNote.trim().length === 0) {
      setError(t('shortNoteIsRequired'));
      return;
    }
    if (formData.shortNote.length > 500) {
      setError(t('shortNoteMaxLength', { max: 500 }));
      return;
    }
    if (formData.contactType !== ContactType.NONE && !formData.contact) {
      setError(t('contactInfoRequired'));
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData as ICreateCamp);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('failedToSubmitCamp'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>{t('wereAGroup')}</h2>

      <div className={styles.formGroup}>
        <label htmlFor="campType">{t('campType')} *</label>
        <select
          id="campType"
          value={formData.campType}
          onChange={(e) => setFormData({ ...formData, campType: e.target.value as CampType })}
          required
        >
          {Object.values(CampType).map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="name">{t('campName')} *</label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder={t('campNamePlaceholder')}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="peopleRange">{t('peopleCount')} *</label>
        <select
          id="peopleRange"
          value={formData.peopleRange}
          onChange={(e) =>
            setFormData({ ...formData, peopleRange: e.target.value as PeopleRange })
          }
          required
        >
          {Object.values(PeopleRange).map((range) => (
            <option key={range} value={range}>
              {range}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label>{t('needs')} * ({t('selectAtLeastOne')})</label>
        <div className={styles.checkboxes}>
          {Object.values(CampNeed).map((need) => (
            <label key={need} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.needs?.includes(need) || false}
                onChange={() => handleNeedToggle(need)}
              />
              {need}
            </label>
          ))}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="shortNote">{t('shortNote')} (max 500 {t('chars')}) *</label>
        <textarea
          id="shortNote"
          value={formData.shortNote}
          onChange={(e) => setFormData({ ...formData, shortNote: e.target.value })}
          maxLength={500}
          rows={4}
          required
        />
        <small>{formData.shortNote?.length || 0}/500 {t('characters')}</small>
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
        <label>Location *</label>
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

export default CampForm;

