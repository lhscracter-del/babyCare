// 공통 버튼 컴포넌트 — 앱 전체에서 일관된 버튼 스타일을 사용합니다

// variant: "primary"(파란색), "secondary"(회색), "danger"(빨간색)
export default function Button({ children, onClick, type = 'button', variant = 'primary', disabled = false, className = '' }) {
  // 버튼 색상 스타일 맵
  const variants = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    success: 'bg-green-500 hover:bg-green-600 text-white',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        px-4 py-2 rounded-lg font-medium text-sm transition-colors
        ${variants[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  )
}
