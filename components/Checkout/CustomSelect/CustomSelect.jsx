import React, { useState, useRef, useEffect } from 'react';
import './CustomSelect.css';

const CustomSelect = ({
  options = [],
  value = '',
  onChange,
  placeholder = 'Select an option',
  isSearchable = true,
  isClearable = true,
  className = '',
  error = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const selectRef = useRef(null);
  const searchInputRef = useRef(null);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Find selected option
  const selectedOption = options.find(option => option.value === value);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = event => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && isSearchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, isSearchable]);

  // Handle keyboard navigation
  const handleKeyDown = e => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleSelect = option => {
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  const handleClear = e => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm('');
      setHighlightedIndex(-1);
    }
  };

  const handleSearchChange = e => {
    setSearchTerm(e.target.value);
    setHighlightedIndex(-1);
  };

  return (
    <div
      ref={selectRef}
      className={`custom-select ${className} ${error ? 'error' : ''}`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div
        className={`custom-select-control ${isOpen ? 'open' : ''}`}
        onClick={handleToggle}
      >
        <div className="custom-select-value">
          {selectedOption ? (
            <span className="custom-select-single-value">
              {selectedOption.label}
            </span>
          ) : (
            <span className="custom-select-placeholder">{placeholder}</span>
          )}
        </div>

        <div className="custom-select-indicators">
          {isClearable && value && (
            <button
              type="button"
              className="custom-select-clear-indicator"
              onClick={handleClear}
              aria-label="Clear selection"
            >
              ×
            </button>
          )}
          <div className="custom-select-dropdown-indicator">
            <svg
              width="12"
              height="8"
              viewBox="0 0 12 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1.5L6 6.5L11 1.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="custom-select-menu">
          {isSearchable && (
            <div className="custom-select-search">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search..."
                className="custom-select-search-input"
              />
            </div>
          )}

          <div className="custom-select-menu-list">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div
                  key={option.value}
                  className={`custom-select-option ${
                    index === highlightedIndex ? 'highlighted' : ''
                  } ${option.value === value ? 'selected' : ''}`}
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {option.label}
                </div>
              ))
            ) : (
              <div className="custom-select-no-options">No options found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
