// 공통 카드 컴포넌트 — 내용을 흰색 박스 안에 보여줄 때 사용합니다

export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-4 ${className}`}>
      {children}
    </div>
  )
}
