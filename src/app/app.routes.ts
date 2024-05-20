import { Routes } from '@angular/router';
import { PipeFrictionComponent } from './pipe-friction/pipe-friction.component';
import { SpringMassComponent } from './spring-mass/spring-mass.component';
import { DataAnalysisComponent } from './data-analysis/data-analysis.component';

export const routes: Routes = [
    {
        path: '',
        component: PipeFrictionComponent
    },
    {
        path: 'cs1-pipe-friction',
        component: PipeFrictionComponent
    },
    {
        path: 'cs2-spring-mass',
        component: SpringMassComponent
    },
    {
        path: 'cs3-experimental-data-analysis',
        component: DataAnalysisComponent
    }
];
