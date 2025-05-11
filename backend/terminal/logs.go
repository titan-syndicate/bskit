package terminal

import (
	"math/rand"
	"time"
)

type TerminalLog struct {
	Content   string    `json:"content"`
	Timestamp time.Time `json:"timestamp"`
}

var mockLogs = []string{
	"kubectl get pods -n default",
	"NAME                     READY   STATUS    RESTARTS   AGE",
	"nginx-7b8748574d-2k4m9   1/1     Running   0          2d",
	"redis-5f4b8d6c7-9x2p3   1/1     Running   1          3d",
	"postgres-8c9d7e6f-5r4t3  1/1     Running   0          4d",
	"",
	"kubectl describe pod nginx-7b8748574d-2k4m9",
	"Name:         nginx-7b8748574d-2k4m9",
	"Namespace:    default",
	"Priority:     0",
	"Node:         worker-1/10.0.0.1",
	"Start Time:   Mon, 10 May 2024 10:00:00 +0000",
	"Labels:       app=nginx",
	"Status:       Running",
	"IP:           10.244.0.5",
	"Containers:",
	"  nginx:",
	"    Container ID:   docker://abc123...",
	"    Image:          nginx:1.21",
	"    State:          Running",
	"      Started:      Mon, 10 May 2024 10:00:05 +0000",
	"    Ready:          True",
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
	"  Normal  Scheduled  2d    default-scheduler  Successfully assigned default/nginx-7b8748574d-2k4m9 to worker-1",
	"  Normal  Pulled     2d    kubelet           Container image \"nginx:1.21\" already present on machine",
	"  Normal  Created    2d    kubelet           Created container nginx",
	"  Normal  Started    2d    kubelet           Started container nginx",
}

// GenerateLogs returns a channel that will continuously emit terminal logs
func GenerateLogs() <-chan TerminalLog {
	logChan := make(chan TerminalLog)

	go func() {
		defer close(logChan)

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
