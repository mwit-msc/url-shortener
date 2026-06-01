import Link from "next/link";
import Image from "next/image";
import { Mail, Shield, FileText, Lock } from "lucide-react";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.51 11.51 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.598 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border/40 mt-auto">
      <div className="container mx-auto px-4 py-6 sm:py-16">
        <div className="grid gap-8 sm:gap-12 md:grid-cols-2 lg:grid-cols-4">
          
          {/* Brand Section */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center space-x-4">
              <Image
                src="/logo.webp"
                alt="MWIT TINY Logo"
                width={120}
                height={56}
                className="rounded-lg"
              />
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold">MWIT TINY</h3>
                <p className="text-base sm:text-lg text-muted-foreground">URL Shortener</p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-base sm:text-lg font-semibold">ลิงก์ด่วน</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/dashboard" 
                  className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <span>แดชบอร์ด</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/report" 
                  className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  <span>รายงานการละเมิด</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/tos" 
                  className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>ข้อกำหนดการใช้บริการ</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/privacy" 
                  className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>นโยบายความเป็นส่วนตัว</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Contact */}
          <div className="space-y-4">
            <h4 className="text-base sm:text-lg font-semibold">การสนับสนุน</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="mailto:admin@mwit.link" 
                  className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>admin@mwit.link</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/mwit-sc" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <GithubIcon className="w-4 h-4" />
                  <span>GitHub</span>
                </a>
              </li>
            </ul>
          </div>

          {/* School Info */}
          <div className="space-y-4">
            <h4 className="text-base sm:text-lg font-semibold">เกี่ยวกับ</h4>
            <div className="text-sm sm:text-base text-muted-foreground space-y-1">
              <p className="font-semibold">พัฒนาโดย</p>
              <p>นายสิรวิชญ์ ดำขำ 34.10</p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-border/40">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm sm:text-base text-muted-foreground text-center sm:text-left">
              <p>&copy; 2025 คณะกรรมการสภานักเรียน โรงเรียนมหิดลวิทยานุสรณ์ สงวนลิขสิทธิ์</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}