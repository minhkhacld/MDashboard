pipeline {
    agent any

    environment {
        NODEJS_HOME = tool name: 'NodeJS' // Tên phiên bản NodeJS bạn đã cấu hình
        PATH = "${env.NODEJS_HOME}/bin:${env.PATH}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Install Dependencies') {
            steps {
                // Cài đặt các dependency của dự án
                sh 'npm install -f'
            }
        }
        stage('Build') {
            steps {
                // Build ứng dụng
                sh 'npm run build'
            }
        }
        stage('Deploy to IIS') {
            steps {
                script {
                    try {
                        // Check and stop app pool if running
                        powershell '''
                        $appPoolName = 'test.dashboardapi'
                        $appPool = Get-IISAppPool -Name $appPoolName
                        if ($appPool.State -eq 'Started') {
                            Stop-WebAppPool -Name $appPoolName
                            Write-Host 'Application pool stopped.'
                        } else {
                            Write-Host 'Application pool is already stopped.'
                        }
                        '''
                        
                        // Check and stop site if running
                        powershell '''
                        $siteName = 'test.dashboard'
                        $site = Get-IISSite -Name $siteName
                        if ($site.State -eq 'Started') {
                            Stop-IISSite -Name $siteName -Confirm:$false
                            Write-Host 'Site stopped.'
                        } else {
                            Write-Host 'Site is already stopped.'
                        }
                        '''
                        
                        // Deploy package to IIS
                        sh '''
                        powershell.exe -Command "Copy-Item -Recurse -Force build/* D:\\webapps\\MDashBoardTest\\DashBoard"
                        '''
                        // Start app pool
                        powershell 'Start-WebAppPool -Name "test.dashboard"'
                        
                        // Start site
                        powershell 'Start-IISSite -Name "test.dashboard"'
                    } 
                    catch (Exception e) {
                        error("Deployment failed: ${e.message}")
                    }
                }
            }
        }
    }

    post {
        always {
            // Clean workspace sau khi hoàn thành build
            cleanWs()
        }
    }
}
