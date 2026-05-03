import { Link } from 'react-router-dom';
import { HiOutlineClock, HiOutlineBookOpen, HiOutlineUsers, HiOutlineArrowRight, HiOutlineCheckCircle } from 'react-icons/hi2';


interface Course {
  id: string;
  title: string;
  description: string;
  tag: string;
  level: string;
  date: string;
  modules: number;
  quota: string;
  progress: number;
  instructor: string;
  instructorInitial: string;
  status: 'enroll' | 'registered' | 'closed';
  gradient: string;
}

const KursusTersedia: React.FC = () => {
  const courses: Course[] = [
    {
      id: '1',
      title: 'Pengantar ML dengan Python',
      description: 'Pelajari konsep dasar ML, preprocessing data, dan membangun model pertama kamu.',
      tag: 'Data Science',
      level: 'Beginner',
      date: '1 Feb - 28 Feb 2026',
      modules: 24,
      quota: 'Sisa: 12',
      progress: 65,
      instructor: 'Dr. Ahmad Subarjo',
      instructorInitial: 'AS',
      status: 'enroll',
      gradient: 'from-emerald-900 to-slate-900',
    },
    {
      id: '2',
      title: 'Full-Stack Development dengan React & Node.js',
      description: 'Bangun aplikasi web modern dari frontend hingga backend secara end-to-end.',
      tag: 'Web Development',
      level: 'Intermediate',
      date: '5 Mar - 30 Mar 2026',
      modules: 15,
      quota: 'Sisa: 12',
      progress: 0,
      instructor: 'DR. Budi Hartono',
      instructorInitial: 'BH',
      status: 'registered',
      gradient: 'from-blue-900 to-slate-900',
    },
    {
      id: '3',
      title: 'Analisis & Perancangan Sistem Informasi',
      description: 'Pelajari teknik analisis kebutuhan, pemodelan sistem, dan perancangan solusi berbasis bisnis.',
      tag: 'System Analyst',
      level: 'Beginner',
      date: '10 Apr - 10 Mei 2026',
      modules: 10,
      quota: 'Maks: 20',
      progress: 65,
      instructor: 'DR. Ani Wijaya',
      instructorInitial: 'AW',
      status: 'closed',
      gradient: 'from-purple-900 to-slate-900',
    },
  ];

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Kursus Tersedia</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {courses.map((course) => (
          <Link key={course.id} to="/user/detail-kursus" className="block group">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 group-hover:shadow-2xl transition-all duration-500 h-full">
              {/* Header / Top Part */}
              <div className={`p-8 bg-gradient-to-br ${course.gradient} relative overflow-hidden h-48 flex flex-col justify-between text-white`}>

              <div className="flex justify-between items-start relative z-10">
                <span className="px-3 py-1 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 rounded-full text-[10px] font-bold text-emerald-300 uppercase tracking-widest">
                  {course.tag}
                </span>
                <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest">
                  {course.level}
                </span>
              </div>

              <div className="relative z-10">
                <h3 className="text-lg font-extrabold leading-tight mb-2 group-hover:text-emerald-400 transition-colors">
                  {course.title}
                </h3>
                <p className="text-[11px] opacity-70 line-clamp-2 leading-relaxed">
                  {course.description}
                </p>
              </div>

              {/* Decorative circle */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
            </div>


            {/* Content Part */}
            <div className="p-6">
              <div className="grid grid-cols-3 gap-2 mb-6">
                <div className="flex items-center gap-2 text-gray-400">
                  <HiOutlineClock className="text-sm" />
                  <span className="text-[10px] font-bold whitespace-nowrap">{course.date.split(' - ')[0]}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 justify-center">
                  <HiOutlineBookOpen className="text-sm" />
                  <span className="text-[10px] font-bold">{course.modules} modul</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 justify-end">
                  <HiOutlineUsers className="text-sm" />
                  <span className="text-[10px] font-bold">{course.quota}</span>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Progres belajar</span>
                  <span className="text-[10px] font-bold text-gray-900">{course.progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Footer Part */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shadow-lg shadow-blue-100">
                    {course.instructorInitial}
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold text-gray-900 leading-none">{course.instructor}</p>
                    <p className="text-[9px] text-gray-400 mt-1 uppercase tracking-tighter">Pengajar</p>
                  </div>
                </div>

                {course.status === 'enroll' && (
                  <button className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-[10px] font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-600 hover:-translate-y-0.5 transition-all">
                    Enroll <HiOutlineArrowRight />
                  </button>
                )}
                {course.status === 'registered' && (
                  <div className="flex items-center gap-2 bg-emerald-100 text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-bold border border-emerald-200">
                    Terdaftar <HiOutlineCheckCircle className="text-lg" />
                  </div>
                )}
                {course.status === 'closed' && (
                  <div className="bg-gray-100 text-gray-400 px-4 py-2 rounded-xl text-[10px] font-bold border border-gray-200">
                    Belum Buka
                  </div>
                )}
              </div>
            </div>
          </div>
        </Link>
      ))}


      </div>

    </div>
  );
};

export default KursusTersedia;
