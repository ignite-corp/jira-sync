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
import { JIRA_USER_LIST } from '@/lib/constants/jira';

type TabType = 'document' | 'tagging';
type DeploymentType = 'release' | 'adhoc' | 'hotfix';
type ProjectKey = 'groupware' | 'hmg-board' | 'cpo';

const DEPLOYMENT_TYPE_LABELS: Record<DeploymentType, string> = {
  release: '정기배포',
  adhoc: '비정기배포',
  hotfix: '핫픽스',
};

interface Ticket {
  key: string;
  summary: string;
  status: string;
  duedate: string | null;
  labels: string[];
}

// 현재 날짜를 YYYY-MM 형식으로 가져오기
const getCurrentMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
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
  const [tagProject, setTagProject] = useState<ProjectKey>('groupware');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [baseMonth, setBaseMonth] = useState<string>(getCurrentMonth());
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [deploymentLabel, setDeploymentLabel] = useState<string>('');
  const [needsQA, setNeedsQA] = useState<boolean>(false);
  const [isApplyingTags, setIsApplyingTags] = useState(false);
  const [appliedTickets, setAppliedTickets] = useState<string[]>([]);

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

  // 티켓 조회 핸들러
  const handleFetchTickets = async () => {
    // 유효성 검증
    if (!tagProject) {
      toast.error('프로젝트를 선택해주세요.');
      return;
    }
    if (!selectedUser) {
      toast.error('담당자를 선택해주세요.');
      return;
    }
    if (!baseMonth) {
      toast.error('기준 월을 선택해주세요.');
      return;
    }

    setIsLoadingTickets(true);
    setTickets([]);
    setSelectedTickets([]);
    setAppliedTickets([]);

    try {
      toast.info('티켓을 조회하는 중...');

      const response = await fetch(
        `/api/deployment/my-tickets?project=${tagProject}&userName=${encodeURIComponent(selectedUser)}&baseMonth=${baseMonth}`
      );
      const result = await response.json();

      if (result.success && result.tickets) {
        setTickets(result.tickets);
        toast.success(`${result.tickets.length}개 티켓을 조회했습니다!`, {
          duration: 3000,
        });
      } else {
        toast.error(result.error || '티켓 조회에 실패했습니다.');
      }
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
    if (selectedTickets.length === tickets.length) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(tickets.map((t) => t.key));
    }
  };

  // 상태별 색상 클래스 반환
  const getStatusColorClass = (status: string) => {
    if (status === '완료' || status === 'Done') {
      return 'bg-green-100 text-green-700';
    } else if (status === '진행 중' || status === 'In Progress') {
      return 'bg-blue-100 text-blue-700';
    } else {
      return 'bg-gray-100 text-gray-700';
    }
  };

  // 배포태그 적용 핸들러
  const handleApplyTags = async () => {
    // 유효성 검증
    if (selectedTickets.length === 0) {
      toast.error('배포 대상 티켓을 선택해주세요.');
      return;
    }
    if (!deploymentLabel.trim()) {
      toast.error('배포 레이블을 입력해주세요.');
      return;
    }

    setIsApplyingTags(true);
    setAppliedTickets([]);

    try {
      toast.info(
        `${selectedTickets.length}개 티켓에 배포태그를 적용하는 중...`
      );

      // 적용할 레이블 구성
      const labels = [deploymentLabel.trim(), 'FE'];
      if (needsQA) {
        labels.push('QA필요');
      }

      const response = await fetch('/api/deployment/apply-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketKeys: selectedTickets,
          labels: labels,
        }),
      });

      const result = await response.json();

      if (result.success && result.successTickets) {
        setAppliedTickets(result.successTickets);

        if (result.failedTickets && result.failedTickets.length > 0) {
          toast.warning(
            `${result.successTickets.length}개 성공, ${result.failedTickets.length}개 실패`,
            { duration: 5000 }
          );
        } else {
          toast.success(
            `${result.successTickets.length}개 티켓에 배포태그가 적용되었습니다!`,
            { duration: 5000 }
          );
        }
      } else {
        toast.error(result.error || '배포태그 적용에 실패했습니다.');
      }
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
                담당자와 기준 월을 선택하여 티켓을 조회하고 배포태그를
                적용합니다
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
                  onValueChange={(value) => {
                    setTagProject(value as ProjectKey);
                    setTickets([]);
                    setSelectedTickets([]);
                    setAppliedTickets([]);
                  }}
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

              {/* 담당자 선택 */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  담당자 선택
                  <span className="text-red-500">*</span>
                </label>
                <Select
                  value={selectedUser}
                  onValueChange={(value) => {
                    setSelectedUser(value);
                    setTickets([]);
                    setSelectedTickets([]);
                    setAppliedTickets([]);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="담당자를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {JIRA_USER_LIST.map((user) => (
                      <SelectItem key={user.hmgAccountId} value={user.name}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 기준 월 선택 */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  기준 월 선택
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  type="month"
                  value={baseMonth}
                  onChange={(e) => {
                    setBaseMonth(e.target.value);
                    setTickets([]);
                    setSelectedTickets([]);
                    setAppliedTickets([]);
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  선택한 월의 티켓만 조회됩니다
                </p>
              </div>

              {/* 티켓 조회 버튼 */}
              <div className="pt-4 border-t">
                <Button
                  onClick={handleFetchTickets}
                  disabled={
                    isLoadingTickets ||
                    !tagProject ||
                    !selectedUser ||
                    !baseMonth
                  }
                  className="w-full"
                  size="lg"
                >
                  <Tag
                    className={`mr-2 h-4 w-4 ${isLoadingTickets ? 'animate-spin' : ''}`}
                  />
                  {isLoadingTickets ? '조회 중...' : '티켓 조회'}
                </Button>
              </div>

              {/* 티켓 목록 */}
              {tickets.length > 0 && (
                <>
                  <div className="pt-4 border-t space-y-4">
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
                        {selectedTickets.length === tickets.length
                          ? '전체 해제'
                          : '전체 선택'}
                      </Button>
                    </div>

                    <div className="border rounded-lg p-4 space-y-2 max-h-96 overflow-y-auto">
                      {tickets.map((ticket) => (
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
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-xs text-muted-foreground">
                                {ticket.key}
                              </div>
                              {ticket.labels && ticket.labels.length > 0 && (
                                <div className="flex gap-1 flex-wrap">
                                  {ticket.labels.slice(0, 3).map((label) => (
                                    <span
                                      key={label}
                                      className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium"
                                    >
                                      {label}
                                    </span>
                                  ))}
                                  {ticket.labels.length > 3 && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                      +{ticket.labels.length - 3}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="text-sm font-medium text-foreground truncate">
                              {ticket.summary}
                            </div>
                            <div className="text-xs mt-1 flex gap-2 items-center">
                              <span
                                className={`px-2 py-0.5 rounded-full font-medium ${getStatusColorClass(ticket.status)}`}
                              >
                                {ticket.status}
                              </span>
                              {ticket.duedate && (
                                <span className="text-muted-foreground">
                                  종료일: {ticket.duedate}
                                </span>
                              )}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {selectedTickets.length}개 티켓 선택됨
                    </p>
                  </div>

                  {/* 레이블 입력 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1">
                      배포 레이블
                      <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="예: hotfix_260101"
                      value={deploymentLabel}
                      onChange={(e) => setDeploymentLabel(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      배포 종류와 날짜를 조합한 레이블을 입력하세요 (예:
                      hotfix_260101, adhoc_251225)
                    </p>
                  </div>

                  {/* QA 필요 체크박스 */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={needsQA}
                        onChange={(e) => setNeedsQA(e.target.checked)}
                        className="cursor-pointer"
                      />
                      <span className="text-sm font-medium">
                        QA 필요 (QA필요 레이블 자동 추가)
                      </span>
                    </label>
                    <p className="text-xs text-muted-foreground pl-6">
                      체크 시 &apos;QA필요&apos; 레이블이 자동으로 추가되며,
                      &apos;FE&apos; 레이블은 기본으로 추가됩니다
                    </p>
                  </div>

                  {/* 적용 버튼 */}
                  <div className="pt-4 border-t">
                    <Button
                      onClick={handleApplyTags}
                      disabled={
                        isApplyingTags ||
                        selectedTickets.length === 0 ||
                        !deploymentLabel.trim()
                      }
                      className="w-full"
                      size="lg"
                    >
                      <Tag
                        className={`mr-2 h-4 w-4 ${isApplyingTags ? 'animate-spin' : ''}`}
                      />
                      {isApplyingTags
                        ? '적용 중...'
                        : '배포대장에 티켓 추가하기'}
                    </Button>
                  </div>

                  {/* 적용 결과 */}
                  {appliedTickets.length > 0 && (
                    <div className="pt-4 border-t">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
                        <p className="text-sm font-semibold text-green-900">
                          ✓ {appliedTickets.length}개 티켓에 배포태그가
                          적용되었습니다!
                        </p>
                        <div className="text-xs text-muted-foreground">
                          적용된 레이블: {deploymentLabel}, FE
                          {needsQA && ', QA필요'}
                        </div>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {appliedTickets.map((ticketKey) => (
                            <a
                              key={ticketKey}
                              href={`https://hmg.atlassian.net/browse/${ticketKey}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline inline-flex items-center gap-1 text-sm block"
                            >
                              {ticketKey}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* 티켓 조회 전 안내 */}
              {tickets.length === 0 && !isLoadingTickets && (
                <div className="text-center py-8 text-muted-foreground">
                  <Tag className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">
                    담당자와 기준 월을 선택한 후 &apos;티켓 조회&apos; 버튼을
                    클릭하세요
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
