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
    searchPlaceholder: string;
    noResults: string;
    searchResultsCount: string;
    sortBy: string;
    sortName: string;
    sortType: string;
    sortAsc: string;
    sortDesc: string;
    contextMenuRename: string;
    contextMenuDelete: string;
    contextMenuNewFile: string;
    contextMenuRenameLabel: string;
    contextMenuNewFilePrompt: string;
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
        searchPlaceholder: 'Search files and folders...',
        noResults: 'No results found',
        searchResultsCount: '{count} results found',
        sortBy: 'Sort by:',
        sortName: 'Name',
        sortType: 'Type',
        sortAsc: 'Ascending',
        sortDesc: 'Descending',
        contextMenuRename: 'Rename',
        contextMenuDelete: 'Delete',
        contextMenuNewFile: 'New File',
        contextMenuRenameLabel: 'Rename file',
        contextMenuNewFilePrompt: 'New file name:',
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
        searchPlaceholder: 'Rechercher des fichiers et dossiers...',
        noResults: 'Aucun résultat trouvé',
        searchResultsCount: '{count} résultats trouvés',
        sortBy: 'Trier par:',
        sortName: 'Nom',
        sortType: 'Type',
        sortAsc: 'Croissant',
        sortDesc: 'Décroissant',
        contextMenuRename: 'Renommer',
        contextMenuDelete: 'Supprimer',
        contextMenuNewFile: 'Nouveau fichier',
        contextMenuRenameLabel: 'Renommer le fichier',
        contextMenuNewFilePrompt: 'Nom du nouveau fichier :',
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
