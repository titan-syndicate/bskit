package terminal

import (
	"fmt"
	"math/rand"
	"time"
)

// ANSI color codes
const (
	Reset     = "\033[0m"
	Red       = "\033[31m"
	Green     = "\033[32m"
	Yellow    = "\033[33m"
	Blue      = "\033[34m"
	Magenta   = "\033[35m"
	Cyan      = "\033[36m"
	White     = "\033[37m"
	BrightRed = "\033[91m"
)

type TerminalLog struct {
	Content   string    `json:"content"`
	Timestamp time.Time `json:"timestamp"`
}

var mockLogs = []string{
	fmt.Sprintf("%skubectl get pods -n default%s", Cyan, Reset),
	"NAME                     READY   STATUS    RESTARTS   AGE",
	fmt.Sprintf("%snginx-7b8748574d-2k4m9%s   1/1     %sRunning%s   0          2d", Green, Reset, Green, Reset),
	fmt.Sprintf("%sredis-5f4b8d6c7-9x2p3%s   1/1     %sRunning%s   1          3d", Green, Reset, Green, Reset),
	fmt.Sprintf("%spostgres-8c9d7e6f-5r4t3%s  1/1     %sRunning%s   0          4d", Green, Reset, Green, Reset),
	"",
	fmt.Sprintf("%skubectl describe pod nginx-7b8748574d-2k4m9%s", Cyan, Reset),
	fmt.Sprintf("%sName:%s         nginx-7b8748574d-2k4m9", Yellow, Reset),
	fmt.Sprintf("%sNamespace:%s    default", Yellow, Reset),
	fmt.Sprintf("%sPriority:%s     0", Yellow, Reset),
	fmt.Sprintf("%sNode:%s         worker-1/10.0.0.1", Yellow, Reset),
	fmt.Sprintf("%sStart Time:%s   Mon, 10 May 2024 10:00:00 +0000", Yellow, Reset),
	fmt.Sprintf("%sLabels:%s       app=nginx", Yellow, Reset),
	fmt.Sprintf("%sStatus:%s       %sRunning%s", Yellow, Reset, Green, Reset),
	fmt.Sprintf("%sIP:%s           10.244.0.5", Yellow, Reset),
	"Containers:",
	fmt.Sprintf("  %snginx:%s", Blue, Reset),
	"    Container ID:   docker://abc123...",
	"    Image:          nginx:1.21",
	fmt.Sprintf("    State:          %sRunning%s", Green, Reset),
	"      Started:      Mon, 10 May 2024 10:00:05 +0000",
	fmt.Sprintf("    Ready:          %sTrue%s", Green, Reset),
	"    Restart Count:  0",
	"    Limits:",
	"      cpu:     500m",
	"      memory:  512Mi",
	"    Requests:",
	"      cpu:     200m",
	"      memory:  256Mi",
	"",
	"Events:",
	"  Type    Reason     Age   From               Message",
	"  ----    ------     ----  ----               -------",
	fmt.Sprintf("  %sNormal%s  Scheduled  2d    default-scheduler  Successfully assigned default/nginx-7b8748574d-2k4m9 to worker-1", Green, Reset),
	fmt.Sprintf("  %sNormal%s  Pulled     2d    kubelet           Container image \"nginx:1.21\" already present on machine", Green, Reset),
	fmt.Sprintf("  %sNormal%s  Created    2d    kubelet           Created container nginx", Green, Reset),
	fmt.Sprintf("  %sNormal%s  Started    2d    kubelet           Started container nginx", Green, Reset),
}

// GenerateLogs returns a channel that will continuously emit terminal logs
func GenerateLogs() <-chan TerminalLog {
	logChan := make(chan TerminalLog)

	go func() {
		defer close(logChan)

		// Add initial delay to allow frontend to set up listeners
		time.Sleep(1 * time.Second)

		for {
			for _, log := range mockLogs {
				select {
				case logChan <- TerminalLog{
					Content:   log,
					Timestamp: time.Now(),
				}:
					// Random delay between 100-300ms
					time.Sleep(time.Duration(rand.Intn(200)+100) * time.Millisecond)
				}
			}
			// Add a small pause before repeating
			time.Sleep(500 * time.Millisecond)
		}
	}()

	return logChan
}
