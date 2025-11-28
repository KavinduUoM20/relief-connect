import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import CampForm from '../components/CampForm';
import SafetyBanner from '../components/SafetyBanner';
import { ICreateCamp } from '@nx-mono-repo-deployment-test/shared/src/interfaces/camp/ICreateCamp';
import { campService } from '../services';
import styles from '../styles/Page.module.css';

export default function Camp() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (data: ICreateCamp) => {
    const response = await campService.createCamp(data);
    if (response.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } else {
      throw new Error(response.error || 'Failed to submit camp');
    }
  };

  if (success) {
    return (
      <div className={styles.container}>
        <Head>
          <title>Camp Registered - Sri Lanka Crisis Help</title>
        </Head>
        <main className={styles.main}>
          <div className={styles.successMessage}>
            <h2>✅ {t('campRegisteredSuccessfully')}</h2>
            <p>{t('yourCampHasBeenRegistered')}</p>
            <p>{t('redirectingToHomePage')}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>We Are a Camp - Sri Lanka Crisis Help</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className={styles.main}>
        <SafetyBanner />
        <div className={styles.pageContent}>
          <CampForm onSubmit={handleSubmit} onCancel={() => router.push('/')} />
        </div>
      </main>
    </div>
  );
}

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
}

