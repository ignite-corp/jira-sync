'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Copy, Check, Home, Plus, Network } from 'lucide-react';
import { toast } from 'sonner';

export default function TemplatesPage() {
  const [copiedCpo, setCopiedCpo] = useState(false);
  const [copiedSofteer, setCopiedSofteer] = useState(false);

  // CPO BO 템플릿
  const cpoTemplate = `🚀 CPO BO 정기배포/핫픽스 체크리스트

< Gitlab >
1. 배포 승인 대기
2. release -> main 머지
   • BO: https://gitlab.hmc.co.kr/kia-cpo/kia-cpo-bo-web/-/merge_requests
   • 프라이싱: https://gitlab.hmc.co.kr/kia-cpo/kia-pricing-bo-web/-/merge_requests
   • 평가사: https://gitlab.hmc.co.kr/kia-cpo/kia-cpo-partner-web/-/merge_requests
   - 담당 PR건들 release 브랜치로 머지 - @cpo-fe 완료시 따봉
   - 릴리즈 발행 (release-yyyyMMdd) - @김가빈
   - 릴리즈 노트: {릴리즈 노트 링크 입력}
3. main 로컬구동 모니터링 - @cpo-fe
4. 배포 전 할 일 확인 - @cpo-fe
5. 운영 배포 trigger - @김가빈
6. main -> stage, stage2 현행화/배포
   a. BO {담당자 태그}
   b. 프라이싱 {담당자 태그}
   c. 평가사 {담당자 태그}
7. 배포 후 모니터링 - @cpo-fe
8. 배포 후 할 일 확인 - @cpo-fe
9. 운영 모니터링 - {모니터링 순서 작성}
10. 배포 완료

📚 참고 링크:
• CPO 배포 관리: https://ignitecorp.atlassian.net/wiki/spaces/CPO/pages/362676616
• Gitlab 그룹: https://gitlab.hmc.co.kr/kia-cpo
`;

  // 소프티어 템플릿
  const softeerTemplate = `🚀 소프티어 정기배포/핫픽스 체크리스트

< 소프티어 배포 >
1. 팀즈 배포 승인 대기
2. release/hotfix -> main 머지
   • Gitlab MR: https://gitlab.hmc.co.kr/ignite-hmg-developers/hmg-developers/-/merge_requests
3. main 로컬구동 모니터링 - @hmg-developers
4. 배포 전 할 일 확인 - @hmg-developers
   • Dev 배포관리: https://ignitecorp.atlassian.net/wiki/spaces/HDS/pages/839024722/Dev
5. main 검증계 배포 (staging 태그 발행)
6. 검증계 배포 완료 대기
   • Gitlab Pipeline: https://gitlab.hmc.co.kr/ignite-hmg-developers/hmg-developers/-/pipelines
   • Argo: https://argo.hmc.co.kr/
7. main 운영계 배포 (release 태그 발행)
8. 배포 후 모니터링 - @hmg-developers
9. 배포 후 할 일 확인
   • Dev 배포관리: https://ignitecorp.atlassian.net/wiki/spaces/HDS/pages/839024722/Dev
10. 팀즈 배포 완료 공유

📚 참고 링크:
• HMG Developers: https://ignitecorp.atlassian.net/wiki/spaces/HDS/overview
• Gitlab: https://gitlab.hmc.co.kr/ignite-hmg-developers/hmg-developers
`;

  // CPO 복사
  const handleCopyCpo = async () => {
    try {
      await navigator.clipboard.writeText(cpoTemplate);
      setCopiedCpo(true);
      toast.success('CPO BO 템플릿이 복사되었습니다!', {
        description: 'Slack에 붙여넣으면 URL이 자동으로 링크로 변환됩니다.',
        duration: 3000,
      });

      setTimeout(() => setCopiedCpo(false), 2000);
    } catch {
      toast.error('복사에 실패했습니다.');
    }
  };

  // 소프티어 복사
  const handleCopySofteer = async () => {
    try {
      await navigator.clipboard.writeText(softeerTemplate);
      setCopiedSofteer(true);
      toast.success('소프티어 템플릿이 복사되었습니다!', {
        description: 'Slack에 붙여넣으면 URL이 자동으로 링크로 변환됩니다.',
        duration: 3000,
      });

      setTimeout(() => setCopiedSofteer(false), 2000);
    } catch {
      toast.error('복사에 실패했습니다.');
    }
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">배포 템플릿</h1>
            <p className="text-sm text-muted-foreground">
              배포 프로세스 체크리스트를 Slack에서 사용할 수 있습니다
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/">
              <Button variant="outline">
                <Home className="mr-2 h-4 w-4" />
                홈으로
              </Button>
            </Link>
            <Link href="/flow-chart">
              <Button variant="outline">
                <Network className="mr-2 h-4 w-4" />
                Flow Chart
              </Button>
            </Link>
            <Link href="/create-ticket">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                티켓 생성
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CPO BO 템플릿 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>CPO BO 정기배포/핫픽스</CardTitle>
                  <CardDescription>
                    Gitlab 배포 프로세스 체크리스트
                  </CardDescription>
                </div>
                <Button
                  onClick={handleCopyCpo}
                  variant={copiedCpo ? 'outline' : 'default'}
                  size="sm"
                >
                  {copiedCpo ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      복사됨!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      복사
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 미리보기 */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">
                  템플릿 미리보기
                </label>
                <div className="p-4 bg-muted/50 rounded-lg border max-h-96 overflow-y-auto text-xs whitespace-pre-wrap space-y-1">
                  {cpoTemplate.split('\n').map((line, idx) => {
                    // URL 자동 링크 변환
                    const urlRegex = /(https?:\/\/[^\s]+)/g;
                    const parts = line.split(urlRegex);

                    return (
                      <div key={idx} className="leading-relaxed">
                        {parts.map((part, partIdx) => {
                          if (part.match(urlRegex)) {
                            return (
                              <a
                                key={partIdx}
                                href={part}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline font-medium"
                              >
                                {part.length > 50
                                  ? `${part.substring(0, 50)}...`
                                  : part}
                              </a>
                            );
                          }
                          return <span key={partIdx}>{part}</span>;
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 소프티어 템플릿 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>소프티어 정기배포/핫픽스</CardTitle>
                  <CardDescription>
                    HMG Developers 배포 프로세스
                  </CardDescription>
                </div>
                <Button
                  onClick={handleCopySofteer}
                  variant={copiedSofteer ? 'outline' : 'default'}
                  size="sm"
                >
                  {copiedSofteer ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      복사됨!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      복사
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 미리보기 */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">
                  템플릿 미리보기
                </label>
                <div className="p-4 bg-muted/50 rounded-lg border max-h-96 overflow-y-auto text-xs whitespace-pre-wrap space-y-1">
                  {softeerTemplate.split('\n').map((line, idx) => {
                    // URL 자동 링크 변환
                    const urlRegex = /(https?:\/\/[^\s]+)/g;
                    const parts = line.split(urlRegex);

                    return (
                      <div key={idx} className="leading-relaxed">
                        {parts.map((part, partIdx) => {
                          if (part.match(urlRegex)) {
                            return (
                              <a
                                key={partIdx}
                                href={part}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline font-medium"
                              >
                                {part.length > 50
                                  ? `${part.substring(0, 50)}...`
                                  : part}
                              </a>
                            );
                          }
                          return <span key={partIdx}>{part}</span>;
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 하단 안내 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">사용 방법</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 사용 방법 */}
            <div>
              <h3 className="text-sm font-semibold mb-3">📝 사용 방법</h3>
              <ol className="text-sm text-muted-foreground space-y-2">
                <li>
                  1. 위 카드에서{' '}
                  <span className="font-semibold text-foreground">
                    &quot;복사&quot;
                  </span>{' '}
                  버튼 클릭
                </li>
                <li>2. Slack 채널로 이동</li>
                <li>3. Ctrl+V (또는 Cmd+V)로 붙여넣기</li>
                <li>
                  4. Slack이 URL을 자동으로{' '}
                  <span className="font-semibold text-foreground">
                    클릭 가능한 파란색 링크
                  </span>
                  로 변환합니다
                </li>
                <li>
                  5. 필요한 부분 (담당자 태그, 날짜, 릴리즈 노트 등)을 직접 수정
                </li>
                <li>6. Enter로 전송</li>
              </ol>
            </div>

            {/* 예시 */}
            <div className="border-t pt-6">
              <h3 className="text-sm font-semibold mb-3">
                💡 Slack URL 자동 링크 변환 예시
              </h3>
              <div className="space-y-2 text-sm">
                <div className="p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="font-mono text-xs text-muted-foreground mb-2">
                    복사되는 내용:
                  </p>
                  <code className="text-xs block">
                    BO:
                    https://gitlab.hmc.co.kr/kia-cpo/kia-cpo-bo-web/-/merge_requests
                  </code>
                </div>
                <div className="flex items-center justify-center text-muted-foreground">
                  ↓ Slack에 붙여넣으면
                </div>
                <div className="p-3 bg-green-50 rounded border border-green-200">
                  <p className="font-mono text-xs text-muted-foreground mb-2">
                    Slack이 자동으로 링크 감지:
                  </p>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs">BO:</span>
                    <a
                      href="https://gitlab.hmc.co.kr/kia-cpo/kia-cpo-bo-web/-/merge_requests"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-medium text-xs break-all"
                    >
                      gitlab.hmc.co.kr/kia-cpo/kia-cpo-bo-web/-/merge_requests
                    </a>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                ✅ Slack은 URL을 자동으로 감지하여 클릭 가능한 링크로 표시합니다
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
