---
name: ux-patterns
description: babyCare에서 확정된 UX 패턴 — 에러 피드백, 삭제 확인, 빈 상태 UI, 이미지 로딩
metadata:
  type: project
---

## 에러 피드백 패턴 (Mutation onError)

모든 useMutation에 onError 핸들러를 추가한다. 현재는 window.alert 사용 (임시).

**Why:** onError 없으면 네트워크 오류 시 사용자가 저장 실패 여부를 알 수 없다.

**How to apply:** 새 훅 작성 시 반드시 onError 포함. 메시지 형식:
```js
onError: (error) => {
  const msg = error?.response?.data?.detail || '[도메인명] [작업명]에 실패했습니다. 다시 시도해 주세요.'
  window.alert(msg)
}
```

## 삭제 확인 패턴 (인라인 확인 버튼)

window.confirm 사용 금지. 인라인 확인/취소 버튼 패턴을 사용한다.

**Why:** window.confirm은 모바일 PWA에서 UI 일관성이 깨지고, 브라우저마다 스타일이 다르다.

**How to apply:** 각 List 컴포넌트에 `const [confirmDeleteId, setConfirmDeleteId] = useState(null)` 추가. 삭제 버튼 클릭 시 confirmDeleteId를 해당 항목 id로 설정, 확인 버튼에서 실제 삭제 + null 초기화.

버튼 스타일:
- 확인: `text-xs bg-red-500 text-white px-2 py-1 rounded-lg`
- 취소: `text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-lg`

## 빈 상태 안내 UI

선택된 아이가 없을 때 빈 화면 대신 안내 UI를 표시한다.

**How to apply:** childId가 없으면 조기 반환으로 안내 메시지 렌더. 아이콘 + 주요 안내 + 보조 설명 구조.

## 이미지 로딩 상태

ImageViewModal에서 이미지 onLoad 이벤트로 loaded 상태 관리. 로딩 중에는 animate-pulse 텍스트 표시.

## 성별 기본값

ChildSetup useForm에 `defaultValues: { gender: 'M' }` 설정. 미선택 제출 방지.

## 차트 터치 지원

SVG 라인 차트의 데이터 포인트에 onTouchStart/onTouchEnd 이벤트 추가. onTouchEnd는 1500ms 딜레이 후 툴팁 숨김.
