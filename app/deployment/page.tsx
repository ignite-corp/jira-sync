'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  FileText,
  Tag,
  Plus,
  ExternalLink,
  Copy,
  Rocket,
} from 'lucide-react';
import { toast } from 'sonner';

type TabType = 'document' | 'tagging';
type DeploymentType = 'release' | 'adhoc' | 'hotfix';
type ProjectKey = 'groupware' | 'hmg-board' | 'cpo';

const DEPLOYMENT_TYPE_LABELS: Record<DeploymentType, string> = {
  release: '정기배포',
  adhoc: '비정기배포',
  hotfix: '핫픽스',
};

export default function DeploymentPage() {
  // 탭 상태
  const [activeTab, setActiveTab] = useState<TabType>('document');

  // === 탭1: 배포대장 문서 생성 ===
  const [docProject, setDocProject] = useState<ProjectKey>('groupware');
  const [deploymentType, setDeploymentType] = useState<DeploymentType | ''>('');
  const [baseDate, setBaseDate] = useState<string>('');
  const [isCreatingDoc, setIsCreatingDoc] = useState(false);
  const [createdDocUrl, setCreatedDocUrl] = useState<string>('');
  const [createdDocTitle, setCreatedDocTitle] = useState<string>('');
  const [existingDocUrl, setExistingDocUrl] = useState<string>('');

  // === 탭2: 배포 대상 티켓 선정 ===
  const [tagProject, setTagProject] = useState<string>('');
  const [deploymentTag, setDeploymentTag] = useState<string>('');
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [myTickets, setMyTickets] = useState<
    Array<{ key: string; summary: string }>
  >([]);
  const [isApplyingTags, setIsApplyingTags] = useState(false);
  const [taggedTickets, setTaggedTickets] = useState<string[]>([]);

  // 배포대장 문서 생성 핸들러
  const handleCreateDocument = async () => {
    // 유효성 검증
    if (!docProject) {
      toast.error('프로젝트를 선택해주세요.');
      return;
    }
    if (!deploymentType) {
      toast.error('배포 종류를 선택해주세요.');
      return;
    }
    if (!baseDate) {
      toast.error('기준 날짜를 선택해주세요.');
      return;
    }

    setIsCreatingDoc(true);
    setCreatedDocUrl('');
    setCreatedDocTitle('');
    setExistingDocUrl('');

    try {
      const deploymentLabel = DEPLOYMENT_TYPE_LABELS[deploymentType];
      toast.info(
        `배포대장 문서를 생성하는 중... (${deploymentLabel} ${baseDate})`
      );

      const response = await fetch('/api/deployment/create-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: docProject,
          deploymentType: deploymentType,
          date: baseDate,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setCreatedDocUrl(result.pageUrl);
        setCreatedDocTitle(`${deploymentType} ${baseDate}`);
        toast.success('배포대장 문서가 생성되었습니다!', { duration: 5000 });
      } else {
        // 중복 페이지가 있는 경우
        if (result.existingPageUrl) {
          setExistingDocUrl(result.existingPageUrl);
          toast.error('이미 같은 배포 종류와 날짜의 배포대장이 존재합니다.', {
            duration: 5000,
          });
        } else {
          toast.error(result.error || '문서 생성에 실패했습니다.');
        }
      }
    } catch (error) {
      toast.error(
        `문서 생성 실패: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setIsCreatingDoc(false);
    }
  };

  // 배포대장 문서 링크 복사
  const handleCopyDocUrl = async () => {
    if (!createdDocUrl) return;
    try {
      await navigator.clipboard.writeText(createdDocUrl);
      toast.success('문서 링크가 복사되었습니다!');
    } catch {
      toast.error('복사에 실패했습니다.');
    }
  };

  // 프로젝트 선택 시 내 담당 티켓 로딩
  const handleTagProjectChange = async (value: string) => {
    setTagProject(value);
    setSelectedTickets([]);
    setMyTickets([]);
    setTaggedTickets([]);

    if (!value) return;

    setIsLoadingTickets(true);
    try {
      toast.info('내 담당 티켓을 조회하는 중...');

      // TODO: API 호출 (나중에 구현)
      // const response = await fetch(`/api/deployment/my-tickets?project=${value}`);
      // const result = await response.json();

      // 임시: Mock 데이터
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockTickets = [
        { key: 'FEHG-1234', summary: '[GW] 로그인 기능 개선' },
        { key: 'FEHG-1235', summary: '[GW] 메인 페이지 버그 수정' },
        { key: 'FEHG-1236', summary: '[CPO] 관리자 페이지 개발' },
      ];
      setMyTickets(mockTickets);
      toast.success(`${mockTickets.length}개 티켓을 불러왔습니다.`);
    } catch (error) {
      toast.error(
        `티켓 조회 실패: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setIsLoadingTickets(false);
    }
  };

  // 티켓 선택/해제
  const handleTicketToggle = (ticketKey: string) => {
    setSelectedTickets((prev) =>
      prev.includes(ticketKey)
        ? prev.filter((key) => key !== ticketKey)
        : [...prev, ticketKey]
    );
  };

  // 전체 선택/해제
  const handleSelectAll = () => {
    if (selectedTickets.length === myTickets.length) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(myTickets.map((t) => t.key));
    }
  };

  // 배포태그 적용 핸들러
  const handleApplyTags = async () => {
    // 유효성 검증
    if (!tagProject) {
      toast.error('프로젝트를 선택해주세요.');
      return;
    }
    if (!deploymentTag.trim()) {
      toast.error('배포태그를 입력해주세요.');
      return;
    }
    if (selectedTickets.length === 0) {
      toast.error('배포 대상 티켓을 선택해주세요.');
      return;
    }

    setIsApplyingTags(true);
    setTaggedTickets([]);

    try {
      toast.info(
        `${selectedTickets.length}개 티켓에 배포태그를 적용하는 중...`
      );

      // TODO: API 호출 (나중에 구현)
      // const response = await fetch('/api/deployment/tag-tickets', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ tickets: selectedTickets, tag: deploymentTag }),
      // });

      // 임시: 2초 딜레이
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 임시 성공 처리
      setTaggedTickets(selectedTickets);
      toast.success(
        `${selectedTickets.length}개 티켓에 배포태그가 적용되었습니다!`,
        { duration: 5000 }
      );
    } catch (error) {
      toast.error(
        `배포태그 적용 실패: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setIsApplyingTags(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                돌아가기
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">배포 대장 관리</h1>
              <p className="text-sm text-muted-foreground">
                배포대장 문서 생성 및 배포 대상 티켓 관리
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/create-epic">
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                에픽 생성
              </Button>
            </Link>
            <Link href="/create-ticket">
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                티켓 생성
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab('document')}
            className={`px-4 py-2 font-medium transition-colors relative ${
              activeTab === 'document'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="inline-block mr-2 h-4 w-4" />
            배포대장 문서 생성
            {activeTab === 'document' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('tagging')}
            className={`px-4 py-2 font-medium transition-colors relative ${
              activeTab === 'tagging'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Tag className="inline-block mr-2 h-4 w-4" />
            배포 대상 티켓 선정
            {activeTab === 'tagging' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        </div>

        {/* Tab 1: 배포대장 문서 생성 */}
        {activeTab === 'document' && (
          <Card>
            <CardHeader>
              <CardTitle>배포대장 문서 자동 생성</CardTitle>
              <CardDescription>
                프로젝트, 배포 종류, 기준 날짜를 선택하면 Confluence 문서가
                자동으로 생성됩니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 프로젝트 선택 */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  프로젝트 선택
                  <span className="text-red-500">*</span>
                </label>
                <Select
                  value={docProject}
                  onValueChange={(value) => setDocProject(value as ProjectKey)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="프로젝트를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="groupware">Groupware (GW)</SelectItem>
                    <SelectItem value="hmg-board" disabled>
                      HMG Board (HB)
                    </SelectItem>
                    <SelectItem value="cpo" disabled>
                      CPO
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  현재는 Groupware만 가능합니다.
                </p>
              </div>

              {/* 배포 종류 선택 */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  배포 종류 선택
                  <span className="text-red-500">*</span>
                </label>
                <Select
                  value={deploymentType}
                  onValueChange={(value) =>
                    setDeploymentType(value as DeploymentType)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="배포 종류를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="release">정기배포 (release)</SelectItem>
                    <SelectItem value="adhoc">비정기배포 (adhoc)</SelectItem>
                    <SelectItem value="hotfix">핫픽스 (hotfix)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 기준 날짜 선택 */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  기준 날짜 선택
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={baseDate}
                  onChange={(e) => setBaseDate(e.target.value)}
                />
                {baseDate && deploymentType && (
                  <p className="text-xs text-blue-600">
                    → 생성될 제목: Dev) 배포 관리 - {deploymentType} {baseDate}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  선택한 날짜를 기준으로 배포대장이 생성됩니다
                </p>
              </div>

              {/* 생성 버튼 */}
              <div className="pt-4 border-t">
                <Button
                  onClick={handleCreateDocument}
                  disabled={
                    isCreatingDoc || !docProject || !deploymentType || !baseDate
                  }
                  className="w-full"
                  size="lg"
                >
                  <Rocket
                    className={`mr-2 h-4 w-4 ${isCreatingDoc ? 'animate-spin' : ''}`}
                  />
                  {isCreatingDoc ? '문서 생성 중...' : '배포대장 문서 생성'}
                </Button>
              </div>

              {/* 생성 결과 */}
              {createdDocUrl && (
                <div className="pt-4 border-t">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
                    <p className="text-sm font-semibold text-green-900">
                      ✓ 배포대장 문서가 생성되었습니다!
                    </p>
                    {createdDocTitle && (
                      <p className="text-sm text-green-900/90">
                        <span className="font-medium">제목:</span> Dev) 배포
                        관리 - {createdDocTitle}
                      </p>
                    )}
                    <div className="flex flex-col gap-2">
                      <a
                        href={createdDocUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center gap-1 font-medium text-sm break-all"
                      >
                        배포대장으로 이동
                        <ExternalLink className="h-4 w-4 flex-shrink-0" />
                      </a>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleCopyDocUrl}
                          variant="outline"
                          size="sm"
                          className="w-fit"
                        >
                          <Copy className="mr-2 h-3 w-3" />
                          문서 링크 복사
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 중복 페이지 경고 */}
              {existingDocUrl && (
                <div className="pt-4 border-t">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg space-y-3">
                    <p className="text-sm font-semibold text-yellow-900">
                      ⚠️ 이미 존재하는 배포대장
                    </p>
                    <p className="text-sm text-yellow-900/90">
                      같은 배포 종류와 날짜의 배포대장이 이미 존재합니다.
                    </p>
                    <div className="flex flex-col gap-2">
                      <a
                        href={existingDocUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center gap-1 font-medium text-sm break-all"
                      >
                        기존 배포대장으로 이동
                        <ExternalLink className="h-4 w-4 flex-shrink-0" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tab 2: 배포 대상 티켓 선정 */}
        {activeTab === 'tagging' && (
          <Card>
            <CardHeader>
              <CardTitle>배포 대상 티켓 선정</CardTitle>
              <CardDescription>
                내 담당 티켓 중 배포 대상 티켓을 선택하고 배포태그를 적용합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 프로젝트 선택 */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  프로젝트 선택
                  <span className="text-red-500">*</span>
                </label>
                <Select
                  value={tagProject}
                  onValueChange={handleTagProjectChange}
                  disabled={isLoadingTickets}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="프로젝트를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="groupware">Groupware (GW)</SelectItem>
                    <SelectItem value="hmg-board" disabled>
                      HMG Board (HB)
                    </SelectItem>
                    <SelectItem value="cpo" disabled>
                      CPO
                    </SelectItem>
                  </SelectContent>
                </Select>
                {isLoadingTickets && (
                  <p className="text-xs text-muted-foreground">
                    내 담당 티켓을 불러오는 중...
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  현재는 Groupware만 가능합니다.
                </p>
              </div>

              {/* 티켓 목록이 로딩되면 표시 */}
              {tagProject && myTickets.length > 0 && (
                <>
                  {/* 배포태그 입력 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1">
                      배포태그 입력
                      <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="예: 2025-01-15-hotfix"
                      value={deploymentTag}
                      onChange={(e) => setDeploymentTag(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      배포를 구분할 수 있는 태그를 입력하세요 (공백 없이)
                    </p>
                  </div>

                  {/* 티켓 선택 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium flex items-center gap-1">
                        배포 대상 티켓 선택
                        <span className="text-red-500">*</span>
                      </label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSelectAll}
                      >
                        {selectedTickets.length === myTickets.length
                          ? '전체 해제'
                          : '전체 선택'}
                      </Button>
                    </div>

                    <div className="border rounded-lg p-4 space-y-2 max-h-96 overflow-y-auto">
                      {myTickets.map((ticket) => (
                        <label
                          key={ticket.key}
                          className="flex items-start gap-3 p-2 rounded hover:bg-muted cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedTickets.includes(ticket.key)}
                            onChange={() => handleTicketToggle(ticket.key)}
                            className="mt-1 cursor-pointer"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">
                              {ticket.key}
                            </div>
                            <div className="text-sm text-muted-foreground truncate">
                              {ticket.summary}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {selectedTickets.length}개 티켓 선택됨
                    </p>
                  </div>

                  {/* 적용 버튼 */}
                  <div className="pt-4 border-t">
                    <Button
                      onClick={handleApplyTags}
                      disabled={
                        isApplyingTags ||
                        !deploymentTag.trim() ||
                        selectedTickets.length === 0
                      }
                      className="w-full"
                      size="lg"
                    >
                      <Tag
                        className={`mr-2 h-4 w-4 ${isApplyingTags ? 'animate-spin' : ''}`}
                      />
                      {isApplyingTags ? '적용 중...' : '배포태그 적용'}
                    </Button>
                  </div>

                  {/* 적용 결과 */}
                  {taggedTickets.length > 0 && (
                    <div className="pt-4 border-t">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
                        <p className="text-sm font-semibold text-green-900">
                          ✓ {taggedTickets.length}개 티켓에 배포태그가
                          적용되었습니다!
                        </p>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {taggedTickets.map((ticketKey) => (
                            <div
                              key={ticketKey}
                              className="flex items-center gap-2"
                            >
                              <a
                                href={`https://hmg.atlassian.net/browse/${ticketKey}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline inline-flex items-center gap-1 text-sm"
                              >
                                {ticketKey}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* 프로젝트 선택 전 안내 */}
              {!tagProject && (
                <div className="text-center py-8 text-muted-foreground">
                  <Tag className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">
                    프로젝트를 선택하면 내 담당 티켓을 불러옵니다
                  </p>
                </div>
              )}

              {/* 티켓이 없는 경우 */}
              {tagProject && !isLoadingTickets && myTickets.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Tag className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">내 담당 티켓이 없습니다</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
