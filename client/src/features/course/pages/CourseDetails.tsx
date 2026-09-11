import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import default_profile from '@assets/default_profile.svg';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { ROUTES } from '@/core/router/paths';
import { getCourseDetails } from '../services/CourseDetails';
import { blockLesson } from '../services/CourseLesson';
import { checkEnrollmentStatus, enrollFreeCourse } from '@features/enrollment/services/EnrollmentService';
import { issueCertificate } from '@/features/certificate/services/CertificateService';
import LessonPlayer from '../components/LessonPlayer';
import ReportModal from '@/shared/components/ReportModal';
import { submitReport } from '@features/review/services/ReviewService';
import { ChatService } from '@/features/chat/services/ChatService';

import ErrorPage from '@shared/ui/ErrorPage';
import type { ModuleType } from '../types/IModule';
import type { LessonType } from '../types/ILesson';
import { useSelector } from 'react-redux';
import type { RootState } from '@/core/store/Index';
import { toast } from 'sonner';
import { UserRole } from '@shared/enums/UserRole';
import { InstructorProfileModal } from '../components/InstructorProfileModal';

import {
  CourseBreadcrumb,
  CourseHero,
  CourseOverview,
  CourseCurriculum,
  CourseDescription,
  CourseReviewsSection,
  CourseSidebar,
} from '../components/details';

const CourseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
  const [blockedLessons, setBlockedLessons] = useState<Set<string>>(new Set());
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [hasAlreadyReviewed, setHasAlreadyReviewed] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isInstructorModalOpen, setIsInstructorModalOpen] = useState(false);

  const role = useSelector((state: RootState) => state.auth.user?.role);
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const navigate = useNavigate();
  const location = useLocation();
  const [isCreatingChat, setIsCreatingChat] = useState<string | null>(null);
  const [isClaimingCertificate, setIsClaimingCertificate] = useState(false);
  const queryClient = useQueryClient();

  const handleMessageInstructor = async () => {
    if (!userId || !course?.instructorId) return;

    setIsCreatingChat(course.id);
    try {
      await ChatService.createConversation({
        studentId: userId,
        instructorId: course.instructorId,
        courseId: course.id,
      });

      // Invalidate conversations query
      queryClient.invalidateQueries({ queryKey: ['conversations', userId] });

      navigate(ROUTES.chat);
    } catch (error) {
      console.error('Failed to start conversation:', error);
      toast.error('Failed to start conversation with instructor');
    } finally {
      setIsCreatingChat(null);
    }
  };

  const {
    data: courseData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['courseDetails', id, role],
    queryFn: () => getCourseDetails(id!),
    enabled: !!id,
    staleTime: role === UserRole.STUDENT ? 0 : 5 * 60 * 1000,
  });

  // Check enrollment status for students
  const { data: enrollmentData } = useQuery({
    queryKey: ['enrollmentStatus', id, userId],
    queryFn: () => checkEnrollmentStatus(id!),
    enabled: !!id && role === UserRole.STUDENT,
    staleTime: 0,
  });

  const course = courseData?.data;

  const blockedLessonIds = useMemo(
    () =>
      course?.modules?.flatMap(
        (mod: ModuleType) =>
          mod.lessons
            ?.filter((les: LessonType) => les.isBlocked)
            .map((les: LessonType) => les.id) || []
      ) || [],
    [course?.modules]
  );

  React.useEffect(() => {
    setBlockedLessons(new Set(blockedLessonIds));
  }, [blockedLessonIds]);

  const isEnrolled = enrollmentData?.data?.isEnrolled || false;

  const toggleModule = (moduleId: string) => {
    setExpandedModuleId((prev) => (prev === moduleId ? null : moduleId));
  };

  const handleEnroll = async () => {
    if (!role) {
      navigate(ROUTES.auth.signIn);
      return;
    }

    // If the course is free, enroll directly without going through payment
    if (course && course.price === 0) {
      try {
        await enrollFreeCourse(id!);
        toast.success('Successfully enrolled in this free course!');
        queryClient.invalidateQueries({
          queryKey: ['enrollmentStatus', id, userId],
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to enroll';
        toast.error(message);
      }
      return;
    }

    navigate(ROUTES.student.checkout.replace(':id', id!));
  };

  const handleClaimCertificate = async () => {
    if (!course?.id) return;
    setIsClaimingCertificate(true);
    try {
      const certificate = await issueCertificate(course.id);
      toast.success('Certificate ready');
      navigate(
        ROUTES.student.certificate.replace(
          ':certificateId',
          certificate.certificateId
        )
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to issue certificate';
      toast.error(message);
    } finally {
      setIsClaimingCertificate(false);
    }
  };

  const handleBlockLesson = async (lessonId: string) => {
    const isCurrentlyBlocked = blockedLessons.has(lessonId);
    const newBlockedStatus = !isCurrentlyBlocked;

    try {
      await blockLesson(lessonId, newBlockedStatus);
      const newBlocked = new Set(blockedLessons);
      if (newBlockedStatus) {
        newBlocked.add(lessonId);
      } else {
        newBlocked.delete(lessonId);
      }
      setBlockedLessons(newBlocked);
    } catch (error) {
      console.error('Failed to block/unblock lesson:', error);
    }
  };

  const handleReportCourse = async (reason: string, description: string) => {
    try {
      await submitReport('course', id!, reason, description);
      toast.success('Course reported to administrators');
    } catch {
      toast.error('Failed to report course');
      throw new Error('Failed to report');
    }
  };

  const handleContinueLearning = () => {
    const firstAvailableLesson = course?.modules
      ?.find((module) =>
        module.lessons?.some((lesson) => lesson.isFreePreview || isEnrolled)
      )
      ?.lessons?.find((lesson) => lesson.isFreePreview || isEnrolled);

    if (firstAvailableLesson) {
      setCurrentLessonId(firstAvailableLesson.id);
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  const handleTakeQuiz = () => {
    if (course?.id) {
      navigate(ROUTES.student.quiz.landing.replace(':courseId', course.id));
    }
  };

  const handleNavigateBack = () => {
    if (location.state?.page && role === UserRole.INSTRUCTOR) {
      navigate(`${ROUTES.instructor.myCourses}?page=${location.state.page}`);
    } else {
      navigate(-1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading course details...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <ErrorPage
          message={
            (error as Error)?.message || 'This course currently unavailable.'
          }
          statusCode={500}
        />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Course not found
          </p>
        </div>
      </div>
    );
  }

  // Helper function to format duration from seconds to readable format
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes < 60) {
      return remainingSeconds > 0
        ? `${minutes}m ${remainingSeconds}s`
        : `${minutes}m`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  const totalLessons =
    course.modules?.reduce(
      (acc: number, mod: ModuleType) => acc + (mod.lessons?.length || 0),
      0
    ) || 0;
  const totalDurationSeconds =
    course.modules?.reduce(
      (acc: number, mod: ModuleType) =>
        acc +
        (mod.lessons?.reduce(
          (lessonAcc: number, les) => lessonAcc + (les.duration || 0),
          0
        ) || 0),
      0
    ) || 0;

  const currentLesson = currentLessonId
    ? course.modules
        ?.flatMap((m: ModuleType) => m.lessons || [])
        .find((l: LessonType) => l.id === currentLessonId)
    : null;

  const currentLessonProgress =
    enrollmentData?.data?.enrollment?.lessonProgress?.find(
      (p: { lessonId: string; lastWatchedSecond: number }) =>
        p.lessonId === currentLessonId
    );

  const initialProgress = currentLessonProgress?.lastWatchedSecond || 0;
  const enrollmentId = enrollmentData?.data?.enrollment?.enrollmentId;

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-[#050914] dark:text-white">
      {/* BREADCRUMB */}
      <CourseBreadcrumb
        courseTitle={course.title}
        onNavigateBack={handleNavigateBack}
      />

      {/* LESSON PLAYER */}
      {currentLessonId ? (
        <div className="bg-[#050914] py-5 sm:py-7">
          <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
            <LessonPlayer
              id={currentLessonId}
              onClose={() => {
                setCurrentLessonId(null);
                queryClient.invalidateQueries({
                  queryKey: ['enrollmentStatus', id, userId],
                });
              }}
              title={currentLesson?.title || ''}
              enrollmentId={enrollmentId}
              initialProgress={initialProgress}
            />
          </div>
        </div>
      ) : (
        <>
          {/* COURSE HERO */}
          <CourseHero
            course={course}
            role={role}
            isEnrolled={isEnrolled}
            isLoading={isLoading}
            enrollmentData={enrollmentData}
            isClaimingCertificate={isClaimingCertificate}
            onRefresh={() => {
              refetch();
              toast.success('Course details refreshed!');
            }}
            onOpenInstructorModal={() => setIsInstructorModalOpen(true)}
            onContinueLearning={handleContinueLearning}
            onEnroll={handleEnroll}
            onClaimCertificate={handleClaimCertificate}
            onTakeQuiz={handleTakeQuiz}
          />

          {/* MAIN CONTENT */}
          <main className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
            <div className="grid grid-cols-1 gap-14 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
              {/* MAIN COLUMN */}
              <div className="min-w-0">
                {/* COURSE OVERVIEW */}
                <CourseOverview
                  modulesCount={course.modules?.length || 0}
                  totalLessons={totalLessons}
                  totalDurationSeconds={totalDurationSeconds}
                  isQuizEnabled={course.isQuizEnabled}
                  formatDuration={formatDuration}
                />

                {/* COURSE CONTENT */}
                <CourseCurriculum
                  modules={course.modules}
                  totalLessons={totalLessons}
                  totalDurationSeconds={totalDurationSeconds}
                  expandedModuleId={expandedModuleId}
                  onToggleModule={toggleModule}
                  role={role}
                  isEnrolled={isEnrolled}
                  blockedLessons={blockedLessons}
                  onBlockLesson={handleBlockLesson}
                  onSelectLesson={(lessonId) => {
                    setCurrentLessonId(lessonId);
                    window.scrollTo({
                      top: 0,
                      behavior: 'smooth',
                    });
                  }}
                  enrollmentData={enrollmentData}
                  formatDuration={formatDuration}
                />

                {/* DESCRIPTION */}
                <CourseDescription description={course.description} />

                {/* REVIEWS */}
                <CourseReviewsSection
                  courseId={id!}
                  userId={userId}
                  role={role}
                  isEnrolled={isEnrolled}
                  showReviewForm={showReviewForm}
                  hasAlreadyReviewed={hasAlreadyReviewed}
                  onOpenReviewForm={() => setShowReviewForm(true)}
                  onCloseReviewForm={() => setShowReviewForm(false)}
                  onReviewSuccess={() => {
                    setShowReviewForm(false);
                    refetch();
                  }}
                  onHasReview={(has) => setHasAlreadyReviewed(has)}
                  onReviewSubmitted={() => {
                    refetch();
                  }}
                />
              </div>

              {/* SIDEBAR */}
              <CourseSidebar
                totalDurationSeconds={totalDurationSeconds}
                tags={course.tags}
                role={role}
                isEnrolled={isEnrolled}
                onOpenReportModal={() => setIsReportModalOpen(true)}
                formatDuration={formatDuration}
              />
            </div>
          </main>
        </>
      )}

      {/* INSTRUCTOR PROFILE MODAL */}
      <InstructorProfileModal
        isOpen={isInstructorModalOpen}
        onClose={() => setIsInstructorModalOpen(false)}
        instructor={course.instructor}
        defaultProfile={default_profile}
        canMessage={role === UserRole.STUDENT && isEnrolled}
        isMessaging={isCreatingChat === course.id}
        onMessage={handleMessageInstructor}
      />

      {/* REPORT MODAL */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleReportCourse}
        targetName={course.title}
        targetType="course"
      />
    </div>
  );
};

export default CourseDetails;
