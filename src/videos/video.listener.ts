import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { VideoEvent } from './video.event';
import { AnalyticService } from '../analytics/analytic.service';
import { InfluxDBService } from '../influxdb.service';

@Injectable()
export class VideoListener {

  constructor (
    private readonly analyticService: AnalyticService,
    private readonly influxDBService: InfluxDBService
  ) {}

  @RabbitSubscribe({
    exchange: 'analytics',
    routingKey: 'videos.*', // Supports * as a wildcard for one word and # as a wildcard for one or more words.
    queue: 'VideoEvent',
  })
  public async videoEventHandler(event: VideoEvent) {
    // logs
    console.log('event', JSON.stringify(event));

    // charging
    await this.influxDBService.writeAnalyticPoint(event);

    // database
    let analytic: any = {
      kind: event.kind,
      url: event.url,
      method: event.method,
      headers: JSON.stringify(event.headers),
      body: JSON.stringify(event.body),
      crud: event.crud,
      charge: event.charge,
      organization: {
        id: event.organizationId
      },
      payload: JSON.stringify(event.payload),
      eventAt: event.eventAt,
    }

    let record = await this.analyticService.create(analytic);
    // console.log(record)
  }
}