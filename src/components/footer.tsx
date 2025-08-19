import Link from "next/link";
import Image from "next/image";
import { Github, Mail, Shield, FileText, Lock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border/40 mt-auto">
      <div className="container mx-auto px-4 py-6 sm:py-16">
        <div className="grid gap-8 sm:gap-12 md:grid-cols-2 lg:grid-cols-4">
          
          {/* Brand Section */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center space-x-4">
              <Image
                src="/sc-logo.png"
                alt="MWIT-SC Logo"
                width={56}
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
                  <Github className="w-4 h-4" />
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