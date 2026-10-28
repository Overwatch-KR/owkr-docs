import { getEntry } from 'astro:content';

export const POLICY_LINKS = [
    { slug: 'terms', title: '이용약관', summary: '서비스 이용 조건과 참가·취소 기준을 확인하세요.', action: '약관 읽기' },
    { slug: 'privacy', title: '개인정보처리방침', summary: '봇이 처리하는 정보와 보관·삭제 기준을 확인하세요.', action: '처리방침 읽기' },
    { slug: 'support', title: '문의·삭제 요청', summary: '오류 신고나 내 정보의 확인·수정·삭제가 필요하신가요?', action: '요청 방법 보기' },
] as const;

export const formatPolicyDate = (date: Date) => new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Seoul',
}).format(date);

export async function getPolicyDocuments() {
    return Promise.all(POLICY_LINKS.map(async (link) => {
        const entry = await getEntry('docs', `gather-bot/${link.slug}`);
        if (!entry || !entry.data.publishedAt) throw new Error(`정책 메타데이터 누락: ${link.slug}`);
        return { ...link, entry };
    }));
}
