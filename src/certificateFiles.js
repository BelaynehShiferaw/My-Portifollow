import { deleteProjectFile, getProjectFile, saveProjectFile } from './projectFiles';

const CERTIFICATES_STORAGE_KEY = 'belayneh-portfolio-certificates';

export const hasExpectedCertificateSignature = async (file) => {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (file.type === 'application/pdf') {
    return String.fromCharCode(...bytes.slice(0, 5)) === '%PDF-';
  }
  if (file.type === 'image/jpeg') {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (file.type === 'image/png') {
    return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
      .every((byte, index) => bytes[index] === byte);
  }
  if (file.type === 'image/webp') {
    return String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
      String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
  }
  return false;
};

export const getLocalCertificates = () => {
  try {
    const certificates = JSON.parse(localStorage.getItem(CERTIFICATES_STORAGE_KEY) || '[]');
    return Array.isArray(certificates) ? certificates : [];
  } catch (error) {
    console.warn('Unable to read locally saved certificates:', error);
    return [];
  }
};

export const saveLocalCertificate = async (file, details) => {
  const storedFile = await saveProjectFile(file);
  const certificate = {
    id: `local-${storedFile.id}`,
    localBlobId: storedFile.id,
    title: details.title,
    issuer: details.issuer,
    date: details.date,
    contentType: file.type,
    size: file.size
  };

  try {
    localStorage.setItem(
      CERTIFICATES_STORAGE_KEY,
      JSON.stringify([certificate, ...getLocalCertificates().filter(item => item.id !== certificate.id)])
    );
  } catch (error) {
    await deleteProjectFile(storedFile.id);
    throw new Error('The certificate file was not saved because browser storage is unavailable.');
  }

  return certificate;
};

export const getLocalCertificateFile = getProjectFile;

export const deleteLocalCertificate = async (certificate) => {
  const certificates = getLocalCertificates().filter(item => item.id !== certificate.id);
  try {
    localStorage.setItem(CERTIFICATES_STORAGE_KEY, JSON.stringify(certificates));
  } catch (error) {
    throw new Error('Unable to remove the saved certificate from browser storage.');
  }
  await deleteProjectFile(certificate.localBlobId);
};
