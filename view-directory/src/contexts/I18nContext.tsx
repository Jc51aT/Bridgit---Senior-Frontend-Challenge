import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'fr';

interface Translations {
    appTitle: string;
    root: string;
    selectFileOrFolder: string;
    loading: string;
    errorLoading: string;
    emptyFolder: string;
    folderLabel: string;
    fileLabel: string;
}

const translations: Record<Language, Translations> = {
    en: {
        appTitle: 'File Explorer',
        root: 'Root',
        selectFileOrFolder: 'Select a file or folder',
        loading: 'Loading...',
        errorLoading: 'Error loading folder: ',
        emptyFolder: '(Empty folder)',
        folderLabel: 'Folder: ',
        fileLabel: 'File: ',
    },
    fr: {
        appTitle: 'Explorateur de fichiers',
        root: 'Racine',
        selectFileOrFolder: 'Sélectionnez un fichier ou un dossier',
        loading: 'Chargement...',
        errorLoading: 'Erreur lors du chargement du dossier: ',
        emptyFolder: '(Dossier vide)',
        folderLabel: 'Dossier: ',
        fileLabel: 'Fichier: ',
    }
};

interface I18nContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: keyof Translations) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('en');

    const t = (key: keyof Translations) => {
        return translations[language][key];
    };

    return (
        <I18nContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </I18nContext.Provider>
    );
};

export const useTranslation = () => {
    const context = useContext(I18nContext);
    if (context === undefined) {
        throw new Error('useTranslation must be used within an I18nProvider');
    }
    return context;
};
