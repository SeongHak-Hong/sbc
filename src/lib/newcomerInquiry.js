// 새가족 페이지 '새가족 등록 문의' 팝업 → 새가족팀 메일 (functions/api/newcomer-inquiry.js)
// 이름·연락처는 메일로만 전하고 어디에도 저장하지 않는다.
export const INQUIRY_LIMITS = { name: 40, contact: 100, question: 500 };

// { name, contact, question, agree, website } — website는 화면에 보이지 않는 칸 (자동 등록 막기)
export const sendNewcomerInquiry = async (fields) => {
    const response = await fetch('/api/newcomer-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || `문의를 보내지 못했어요. (${response.status})`);
    return result;
};
