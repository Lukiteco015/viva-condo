"use client";
import { FaSearch } from "react-icons/fa";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Pesquisar",
  className = "",
}: SearchBarProps) {
  return (
    <div className={`relative w-full max-w-sm ${className}`}>
      <FaSearch className="absolute left-3 top-3 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-3 py-2 w-full border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
      />
    </div>
  );
}