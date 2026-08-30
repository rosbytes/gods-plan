const EPOCH = 1735689600000n // 2025-01-01T00:00:00Z

const WORKER_ID_BITS = 10n
const SEQUENCE_BITS = 12n

const MAX_WORKER_ID = (1n << WORKER_ID_BITS) - 1n
const MAX_SEQUENCE = (1n << SEQUENCE_BITS) - 1n

const WORKER_ID_SHIFT = SEQUENCE_BITS
const TIMESTAMP_SHIFT = WORKER_ID_BITS + SEQUENCE_BITS

export class OrderCodeGenerator {
    private readonly workerId: bigint
    private lastTimestamp = -1n
    private sequence = 0n

    constructor(workerId: number) {
        if (!Number.isInteger(workerId) || workerId < 0 || BigInt(workerId) > MAX_WORKER_ID) {
            throw new Error(`workerId must be between 0 and ${MAX_WORKER_ID}`)
        }

        this.workerId = BigInt(workerId)
    }

    generate(): string {
        let timestamp = BigInt(Date.now())

        if (timestamp < this.lastTimestamp) {
            throw new Error("System clock moved backwards")
        }

        if (timestamp === this.lastTimestamp) {
            this.sequence = (this.sequence + 1n) & MAX_SEQUENCE

            if (this.sequence === 0n) {
                timestamp = this.waitForNextMillisecond(timestamp)
            }
        } else {
            this.sequence = 0n
        }

        this.lastTimestamp = timestamp

        const id =
            ((timestamp - EPOCH) << TIMESTAMP_SHIFT) |
            (this.workerId << WORKER_ID_SHIFT) |
            this.sequence

        return id.toString()
    }

    private waitForNextMillisecond(timestamp: bigint): bigint {
        let now = BigInt(Date.now())

        while (now <= timestamp) {
            now = BigInt(Date.now())
        }

        return now
    }
}

const orderCodeGenerator1 = new OrderCodeGenerator(1)
const orderCodeGenerator2 = new OrderCodeGenerator(2)
const orderCodeGenerator3 = new OrderCodeGenerator(3)

const orderCode1 = orderCodeGenerator1.generate()
const orderCode2 = orderCodeGenerator1.generate()
const orderCode3 = orderCodeGenerator1.generate()
const orderCode4 = orderCodeGenerator2.generate()
const orderCode5 = orderCodeGenerator2.generate()
const orderCode6 = orderCodeGenerator2.generate()
const orderCode7 = orderCodeGenerator3.generate()
const orderCode8 = orderCodeGenerator3.generate()
const orderCode9 = orderCodeGenerator3.generate()

console.log(orderCode1)
console.log(orderCode2)
console.log(orderCode3)
console.log(orderCode4)
console.log(orderCode5)
console.log(orderCode6)
console.log(orderCode7)
console.log(orderCode8)
console.log(orderCode9)
console.log(new Date())
