import React, { useCallback, useState } from 'react';
import { debounce } from 'lodash';
import { FaSearch } from 'react-icons/fa';

interface SearchProps {
    onSearch: (query: string) => void;
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
}

const Search: React.FC<SearchProps> = ({ 
    onSearch, 
    placeholder = 'Search...',
    value = '',
    onChange
}) => {
    const [searchQuery, setSearchQuery] = useState(value);

    const debouncedSearch = useCallback(
        debounce((query: string) => {
            onSearch(query);
        }, 300),
        [onSearch]
    );

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (onChange) {
            onChange(query);
        }
        if (query.trim()) {
            debouncedSearch(query);
        } else {
            onSearch('');
        }
    };

    return (
        <div className="relative mb-4">
            <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder={placeholder}
                className="w-full p-2 pl-10 rounded-lg bg-teal-700 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
    );
};

export default Search; 